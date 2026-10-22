import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

/** DELETE — unblock. Only removes the viewer's own block, never the other side's. */
export async function DELETE(_req: Request, { params }: { params: { userId: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  await prisma.userBlock.deleteMany({ where: { blockerId: me.id, blockedId: params.userId } });
  return NextResponse.json({ ok: true });
}
