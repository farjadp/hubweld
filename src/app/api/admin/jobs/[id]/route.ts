import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { z } from "zod";
import { rejectPendingBids, notifyBidsClosed } from "@/lib/jobs";

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  budget: z.number().int().min(0).nullable().optional(),
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await requireAdmin();
  if (!me) return forbidden();
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const cancelling = parsed.data.status === "CANCELLED" && job.status !== "CANCELLED";
  const closed = await prisma.$transaction(async (tx) => {
    await tx.job.update({ where: { id: params.id }, data: parsed.data });
    return cancelling ? rejectPendingBids(tx, [job.id]) : [];
  });
  notifyBidsClosed(closed);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await requireAdmin();
  if (!me) return forbidden();
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
