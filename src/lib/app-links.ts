/**
 * Store listings for the HubWeld mobile app (Expo project in /mobile).
 *
 * Read at request time so a listing can go live with an env change and no
 * rebuild. While a variable is unset, that platform's button renders as
 * "Coming soon" instead of linking anywhere.
 */
export type AppLinks = { ios: string | null; android: string | null };

function clean(value: string | undefined): string | null {
  const v = value?.trim();
  return v && /^https:\/\//.test(v) ? v : null;
}

export function getAppLinks(): AppLinks {
  return {
    ios: clean(process.env.APP_STORE_URL),
    android: clean(process.env.PLAY_STORE_URL),
  };
}
