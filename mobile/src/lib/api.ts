import { API_URL } from "@/lib/config";
import { saveRefreshToken } from "@/lib/session";

/**
 * The one way the app talks to the server.
 *
 * - Attaches the access token and refreshes it shortly before it expires.
 * - On a 401 it refreshes once and retries; if that fails the session is over
 *   and `onSessionExpired` signs the user out.
 * - Refreshes are single-flight: the server rotates the refresh token on every
 *   use, so two concurrent refreshes would sign the second caller out.
 * - Throws ApiError carrying the server's own message, so screens can show
 *   "Job is not open" rather than "Request failed".
 */

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

type Tokens = { accessToken: string; refreshToken: string; expiresAt: number };

let tokens: Tokens | null = null;
let refreshing: Promise<boolean> | null = null;
let onSessionExpired: () => void = () => {};

export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

export function hasSession(): boolean {
  return tokens !== null;
}

/** Install a fresh pair (sign-in) or a stored refresh token (cold start). */
export async function setTokens(t: { accessToken?: string; refreshToken: string; expiresIn?: number } | null) {
  if (!t) {
    tokens = null;
    return;
  }
  tokens = {
    accessToken: t.accessToken ?? "",
    refreshToken: t.refreshToken,
    // No access token yet means "refresh before the first call".
    expiresAt: t.accessToken && t.expiresIn ? Date.now() + t.expiresIn * 1000 : 0,
  };
  await saveRefreshToken(t.refreshToken);
}

export function getRefreshToken(): string | null {
  return tokens?.refreshToken ?? null;
}

/**
 * Exchange the refresh token. Resolves true on success, false when the server
 * says the session is dead. Network failures throw, so an offline cold start
 * does not sign anyone out.
 */
export function refreshTokens(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const current = tokens;
      if (!current) return false;
      const res = await fetch(`${API_URL}/api/mobile/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      if (res.status === 401 || res.status === 400) return false;
      if (!res.ok) throw new ApiError(`Could not reach HubWeld (${res.status})`, res.status);
      const next = (await res.json()) as { accessToken: string; refreshToken: string; expiresIn: number };
      await setTokens(next);
      return true;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** multipart upload; sent as-is */
  form?: FormData;
  signal?: AbortSignal;
};

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (tokens && Date.now() > tokens.expiresAt - 30_000) {
    if (!(await refreshTokens())) return expire();
  }

  let res = await send(path, opts);
  if (res.status === 401 && tokens) {
    if (!(await refreshTokens())) return expire();
    res = await send(path, opts);
    if (res.status === 401) return expire();
  }

  if (!res.ok) {
    let message = `Something went wrong (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* non-JSON error body: keep the status message */
    }
    throw new ApiError(message, res.status);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function send(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form; // fetch sets the multipart boundary itself
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  return fetch(`${API_URL}${path}`, { method: opts.method ?? "GET", headers, body, signal: opts.signal });
}

function expire(): never {
  tokens = null;
  onSessionExpired();
  throw new ApiError("Your session has ended. Please sign in again.", 401);
}

/** A screen-ready message for anything a request can throw. */
export function errorMessage(e: unknown, fallback = "Something went wrong"): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof TypeError) return "Can't reach HubWeld. Check your connection and try again.";
  return e instanceof Error && e.message ? e.message : fallback;
}
