import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

/** Void an invoice issued in error. One with money against it stays: that is the audit trail. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const me = await requireAdmin();
  if (!me) return forbidden();
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id }, include: { _count: { select: { payments: true } } } });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "VOID") return NextResponse.json({ error: "Already void" }, { status: 400 });
  if (invoice._count.payments > 0) return NextResponse.json({ error: "Payments are recorded against this invoice, so it cannot be voided" }, { status: 400 });
  await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "VOID" } });
  return NextResponse.json({ ok: true });
}
