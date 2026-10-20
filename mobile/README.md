# HubWeld mobile

iOS and Android app for HubWeld, built with Expo SDK 58 (React Native 0.88), Expo Router and Uniwind (Tailwind 4). It talks to the same API as the site in `../src/app/api`; see "Mobile app API" in the root README.

## Run it

The app needs the HubWeld site running for its API.

```bash
# from the repo root
npm run dev                      # site + API on :3000

# in mobile/
npm install
npx expo run:ios                 # or: npx expo run:android
```

This is a **development build**, not Expo Go: push notifications, the camera and the secure keychain need native code that Expo Go does not fully include.

The API address comes from `EXPO_PUBLIC_API_URL` (see `.env.example`). When it isn't set in development, the app uses port 3000 on the machine running Metro, which works from a simulator and from a phone on the same Wi-Fi. The Android emulator needs `http://10.0.2.2:3000`.

If `pod install` fails with `Unicode Normalization not appropriate for ASCII-8BIT`, your shell isn't UTF-8: `export LANG=en_US.UTF-8`.

## Who sees what

| Role | Tabs |
| --- | --- |
| Signed out | Home · Jobs · Shop · Account (browse only; actions ask to sign in) |
| Customer | Home · My jobs · Shop · Cart · Account |
| Welder | Home · Find work · Shop · Cart · Account |
| Supplier | Home · Sales · Shop · Cart · Account |

Admin work stays on the website.

## Layout

```
src/app/            screens (Expo Router: every file is a route)
  (tabs)/           the tab bar; tabs are hidden per role in (tabs)/_layout.tsx
  job/ product/ …   pushed detail screens; protected ones are listed in _layout.tsx
src/components/ui/  design-system primitives (Text, Button, Card, Field, …)
src/lib/
  api.ts            fetch wrapper: bearer token, single-flight refresh, ApiError
  auth.tsx          sign-in state; refresh token in the keychain (session.ts)
  queries.ts        every server read/write, as TanStack Query hooks
  push.ts           push registration and notification-tap routing
  upload.ts         camera/library → JPEG ≤2000px → /api/profile/upload
```

API response types are imported from `../src/lib/api-types.ts` (`@shared/api-types`) with `import type` only. Never import runtime code from the site.

## Design

"Forged Industrial · Daylight", same as the site (`../memory.md`): light surfaces, red only for actions and status, condensed uppercase headings, plasma-cut button plates (`Plate.tsx`), the weld-seam divider (`Seam.tsx`). The tokens are in `src/global.css`. Each font weight is its own family, so use the `font-body-*` / `font-display*` / `font-mono` classes and never `font-bold`.

`src/uniwind-types.d.ts` is generated. Metro rewrites it, or run `npx uniwind generate-artifacts --css ./src/global.css --dts ./src/uniwind-types.d.ts` after changing the theme.

## Release

1. `npx eas-cli@latest init` links the project to EAS and writes the `projectId` into `app.json`. Push tokens need it.
2. `npx eas-cli@latest credentials` sets up the Apple push key and Android FCM v1 credentials.
3. `npx eas-cli@latest build --profile production --platform all`, then `eas submit`.

`eas.json` points every profile at `https://hubweld.ca`. Bundle id / package: `ca.hubweld.app`.
