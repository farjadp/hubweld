import * as SecureStore from "expo-secure-store";
import type { SessionUser } from "@shared/api-types";

/**
 * Persistence for the signed-in session.
 *
 * Only the refresh token and the cached user go to the keychain/keystore. The
 * access token lives in memory: it is good for 15 minutes and a cold start
 * simply refreshes it.
 */

const REFRESH_KEY = "hubweld.refreshToken";
const USER_KEY = "hubweld.user";

const opts: SecureStore.SecureStoreOptions = {
  // Readable after the first unlock so a notification tap can still load data.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export async function loadSession(): Promise<{ refreshToken: string; user: SessionUser } | null> {
  try {
    const [refreshToken, rawUser] = await Promise.all([
      SecureStore.getItemAsync(REFRESH_KEY, opts),
      SecureStore.getItemAsync(USER_KEY, opts),
    ]);
    if (!refreshToken || !rawUser) return null;
    return { refreshToken, user: JSON.parse(rawUser) as SessionUser };
  } catch {
    // A corrupt or unreadable store is a signed-out user, not a crash.
    return null;
  }
}

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_KEY, token, opts);
}

export async function saveUser(user: SessionUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user), opts);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(REFRESH_KEY, opts),
    SecureStore.deleteItemAsync(USER_KEY, opts),
  ]);
}
