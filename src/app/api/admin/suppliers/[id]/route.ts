import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function adminGuard() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") return null;
  return me;
}

const patchSchema = z.object({
  approved: z.boolean().optional(),
  businessName: z.string().min(2).optional(),
  description: z.string().optional(),
  website: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await adminGuard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const profile = await prisma.supplierProfile.findUnique({ where: { id: params.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await prisma.supplierProfile.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await adminGuard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const profile = await prisma.supplierProfile.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.user.delete({ where: { id: profile.userId } });
  return NextResponse.json({ ok: true });
}
