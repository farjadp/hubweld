import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthResponse, Role, SessionUser } from "@shared/api-types";
import { api, getRefreshToken, refreshTokens, setSessionExpiredHandler, setTokens } from "@/lib/api";
import { clearSession, loadSession, saveUser } from "@/lib/session";

type Status = "loading" | "signedOut" | "signedIn";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, "ADMIN">;
  city?: string;
  businessName?: string;
};

type AuthContextValue = {
  status: Status;
  user: SessionUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  /** After the account was deleted server-side: forget it locally. */
  forget: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  const forget = useCallback(async () => {
    await setTokens(null);
    await clearSession();
    queryClient.clear();
    setUser(null);
    setStatus("signedOut");
  }, [queryClient]);

  // Restore a stored session on launch.
  useEffect(() => {
    setSessionExpiredHandler(() => void forget());
    (async () => {
      const stored = await loadSession();
      if (!stored) {
        setStatus("signedOut");
        return;
      }
      await setTokens({ refreshToken: stored.refreshToken });
      try {
        if (!(await refreshTokens())) {
          await forget();
          return;
        }
      } catch {
        // Offline at launch: keep the session and let the next request retry.
      }
      setUser(stored.user);
      setStatus("signedIn");
    })();
  }, [forget]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await api<AuthResponse>("/api/mobile/auth/login", {
      method: "POST",
      body: {
        email: email.trim().toLowerCase(),
        password,
        platform: Platform.OS === "ios" ? "ios" : "android",
        deviceName: Device.deviceName ?? Device.modelName ?? "",
      },
    });
    await setTokens(res);
    await saveUser(res.user);
    queryClient.clear();
    setUser(res.user);
    setStatus("signedIn");
  }, [queryClient]);

  const register = useCallback(async (input: RegisterInput) => {
    await api("/api/auth/register", { method: "POST", body: { ...input, email: input.email.trim().toLowerCase() } });
    await signIn(input.email, input.password);
  }, [signIn]);

  const signOut = useCallback(async () => {
    if (getRefreshToken()) {
      // Best effort: revoking on the server also stops this device's pushes.
      await api("/api/mobile/auth/logout", { method: "POST" }).catch(() => {});
    }
    await forget();
  }, [forget]);

  const value = useMemo(() => ({ status, user, signIn, register, signOut, forget }), [status, user, signIn, register, signOut, forget]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
