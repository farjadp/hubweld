/**
 * Store listings for the HubWeld mobile app (Expo project in /mobile).
 *
 * Read at request time so a listing can go live with an env change and no
 * rebuild. While a variable is unset, that platform's button renders as
 * "Coming soon" instead of linking anywhere.
 *
 * ANDROID_APK_URL is the direct download for phones without Google Play. It
 * should point at the universal APK Play Console signs with the app signing
 * key, so a sideloaded copy updates cleanly from Play later.
 */
export type AppLinks = { ios: string | null; android: string | null; apk: string | null };

function clean(value: string | undefined): string | null {
  const v = value?.trim();
  return v && /^https:\/\//.test(v) ? v : null;
}

export function getAppLinks(): AppLinks {
  return {
    ios: clean(process.env.APP_STORE_URL),
    android: clean(process.env.PLAY_STORE_URL),
    apk: clean(process.env.ANDROID_APK_URL),
  };
}
