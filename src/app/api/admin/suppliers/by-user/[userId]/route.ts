import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  if (!(await requireAdmin())) return forbidden();
  const profile = await prisma.supplierProfile.findUnique({ where: { userId: params.userId } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: profile.id });
}
