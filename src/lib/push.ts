import { prisma } from "@/lib/prisma";

/**
 * Push notifications to the mobile app, through Expo's push service.
 *
 * Like sendMailSafe, this never throws and never blocks the request that
 * triggered it: a bid is placed whether or not the customer's phone hears
 * about it. Call it without awaiting.
 *
 * Tokens come from MobileSession.pushToken (one per signed-in device). A token
 * Expo reports as DeviceNotRegistered — app uninstalled, notifications revoked
 * — is cleared so it is not tried again.
 *
 * Set EXPO_ACCESS_TOKEN if "enhanced push security" is turned on for the Expo
 * project; without it the service accepts unauthenticated sends.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH = 100; // Expo's per-request limit

/** Where a tap should take the user. The app maps `type` to a screen. */
export type PushData =
  | { type: "job"; jobId: string }
  | { type: "message"; jobId: string }
  | { type: "order"; orderId: string }
  | { type: "supplier-order"; orderId: string };

export type PushMessage = { title: string; body: string; data: PushData };

type Ticket = { status: "ok" | "error"; details?: { error?: string } };

export function notifyUsers(userIds: string | string[], message: PushMessage): void {
  const ids = [...new Set(Array.isArray(userIds) ? userIds : [userIds])].filter(Boolean);
  if (ids.length === 0) return;
  void send(ids, message).catch((e) => console.error("[push] send failed", e));
}

async function send(userIds: string[], message: PushMessage): Promise<void> {
  const sessions = await prisma.mobileSession.findMany({
    where: { userId: { in: userIds }, revokedAt: null, pushToken: { not: null } },
    select: { pushToken: true },
  });
  const tokens = [...new Set(sessions.map((s) => s.pushToken!))];
  if (tokens.length === 0) return;

  const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (process.env.EXPO_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;

  for (let i = 0; i < tokens.length; i += BATCH) {
    const chunk = tokens.slice(i, i + BATCH);
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(
        chunk.map((to) => ({ to, title: message.title, body: message.body, data: message.data, sound: "default" }))
      ),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[push] Expo responded ${res.status}: ${await res.text().catch(() => "")}`);
      continue;
    }

    // Tickets come back in the order the messages were sent.
    const { data } = (await res.json()) as { data?: Ticket[] };
    const dead = (data ?? [])
      .map((t, idx) => (t.status === "error" && t.details?.error === "DeviceNotRegistered" ? chunk[idx] : null))
      .filter((t): t is string => !!t);
    if (dead.length > 0) {
      await prisma.mobileSession.updateMany({ where: { pushToken: { in: dead } }, data: { pushToken: null } });
    }
  }
}

/** Trim a message body for a notification preview. */
export function preview(text: string, max = 120): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}
