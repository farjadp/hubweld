import Constants from "expo-constants";

/**
 * Where the HubWeld API lives.
 *
 * EXPO_PUBLIC_API_URL wins when set (inlined at build time — see .env.example).
 * In development without it, the API is assumed to run on port 3000 of the
 * machine serving the JS bundle, which works from a simulator and from a
 * physical phone on the same network.
 */
function devHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.20:8081"
  if (!hostUri) return null;
  return `http://${hostUri.split(":")[0]}:3000`;
}

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? devHost() : null) ||
  "https://hubweld.ca"
).replace(/\/$/, "");

/** Uploaded files and product shots may be site-relative (/api/files/...). */
export function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
