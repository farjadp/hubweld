import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { BlockedUser } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** GET — the users the viewer has blocked, newest first, so they can unblock. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const rows = await prisma.userBlock.findMany({
    where: { blockerId: me.id },
    include: { blocked: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
  const body: BlockedUser[] = rows.map((r) => ({
    id: r.blocked.id,
    name: r.blocked.name,
    role: r.blocked.role as BlockedUser["role"],
    blockedAt: r.createdAt.toISOString(),
  }));
  return NextResponse.json(body);
}

const schema = z.object({ userId: z.string().min(1).max(100) });

/** POST — block a user. Idempotent; blocking yourself or an admin is refused. */
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { userId } = parsed.data;
  if (userId === me.id) return NextResponse.json({ error: "You can't block yourself." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  // HubWeld staff must stay reachable; report them instead.
  if (target.role === "ADMIN") return NextResponse.json({ error: "You can't block HubWeld staff." }, { status: 400 });

  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId: me.id, blockedId: userId } },
    create: { blockerId: me.id, blockedId: userId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
