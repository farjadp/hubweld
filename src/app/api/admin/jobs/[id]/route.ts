import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function adminGuard() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") return null;
  return me;
}

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  budget: z.number().int().min(0).nullable().optional(),
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await adminGuard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await prisma.job.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await adminGuard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
