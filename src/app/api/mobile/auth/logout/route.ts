import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { revokeMobileSession } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

/** Sign this device out and stop its push notifications. */
export async function POST() {
  const me = await getCurrentUser();
  if (me?.mobileSessionId) await revokeMobileSession(me.mobileSessionId);
  // Signing out an already-dead session is still a successful sign-out.
  return NextResponse.json({ ok: true });
}
