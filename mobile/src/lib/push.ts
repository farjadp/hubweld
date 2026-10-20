import { useEffect } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * Push notifications.
 *
 * The server sends through Expo (src/lib/push.ts in the site) with a `data`
 * payload naming what the alert is about; tapping it opens that screen.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type PushData =
  | { type: "job"; jobId: string }
  | { type: "message"; jobId: string }
  | { type: "order"; orderId: string }
  | { type: "supplier-order"; orderId: string };

function routeFor(data: Partial<PushData> | undefined) {
  switch (data?.type) {
    case "job":
      return data.jobId ? { pathname: "/job/[id]" as const, params: { id: data.jobId } } : null;
    case "message":
      return data.jobId ? { pathname: "/job/[id]/chat" as const, params: { id: data.jobId } } : null;
    case "order":
      return data.orderId ? { pathname: "/order/[id]" as const, params: { id: data.orderId } } : null;
    case "supplier-order":
      return { pathname: "/(tabs)/sales" as const };
    default:
      return null;
  }
}

async function registerDevice(): Promise<void> {
  // Simulators get no push token; there is nothing to register.
  if (!Device.isDevice) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "HubWeld",
      importance: AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted && current.canAskAgain) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn("[push] No EAS projectId configured; run `eas init` to enable push notifications.");
    return;
  }
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await api("/api/mobile/push-token", { method: "PUT", body: { token } });
}

/**
 * Mount once, inside the signed-in app: registers this device for push and
 * routes notification taps, including the one that cold-started the app.
 */
export function usePushNotifications() {
  const { status } = useAuth();
  const qc = useQueryClient();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (status !== "signedIn") return;
    registerDevice().catch((e) => console.warn("[push] registration failed", e));
  }, [status]);

  // A tap (cold start or background) opens the related screen.
  useEffect(() => {
    if (status !== "signedIn" || !lastResponse) return;
    const target = routeFor(lastResponse.notification.request.content.data as Partial<PushData>);
    if (target) router.push(target as never);
    void Notifications.clearLastNotificationResponseAsync();
  }, [status, lastResponse]);

  // An alert while the app is open means something changed: refetch.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      void qc.invalidateQueries();
    });
    return () => sub.remove();
  }, [qc]);
}
