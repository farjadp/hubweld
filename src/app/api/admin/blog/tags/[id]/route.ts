import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden();
  const tag = await prisma.postTag.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // PostToTag cascades on tag delete, so the join rows go with it.
  await prisma.postTag.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
