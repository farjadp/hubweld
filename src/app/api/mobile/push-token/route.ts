import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  // Expo push tokens look like ExponentPushToken[xxxx]; null turns alerts off.
  token: z.string().regex(/^Expo(nent)?PushToken\[[^\]]+\]$/, "Not an Expo push token").nullable(),
});

/** Register (or clear) this device's push token. */
export async function PUT(req: Request) {
  const me = await getCurrentUser();
  if (!me?.mobileSessionId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  const { token } = parsed.data;

  await prisma.$transaction([
    // A token belongs to one install. If the phone changed hands, the previous
    // account must stop getting its alerts.
    ...(token
      ? [prisma.mobileSession.updateMany({ where: { pushToken: token, NOT: { id: me.mobileSessionId } }, data: { pushToken: null } })]
      : []),
    prisma.mobileSession.update({ where: { id: me.mobileSessionId }, data: { pushToken: token } }),
  ]);
  return NextResponse.json({ ok: true });
}
