import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { nextInvoiceNumber } from "@/lib/invoices";

const schema = z.object({
  // Defaults to the order total; ops lowers it when a line was cancelled.
  amountCents: z.number().int().positive().optional(),
  dueDays: z.number().int().min(0).max(120).default(7),
  notes: z.string().max(2000).default(""),
});

/** Issue the invoice for an order, after the follow-up call. One live invoice per order. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await requireAdmin();
  if (!me) return forbidden();
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { invoices: { where: { status: { not: "VOID" } }, select: { number: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "CANCELLED") return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
  if (order.invoices.length) {
    return NextResponse.json({ error: `Already invoiced as ${order.invoices[0].number}. Void it to issue a new one.` }, { status: 409 });
  }

  const issuedAt = new Date();
  const data = {
    orderId: order.id,
    amountCents: parsed.data.amountCents ?? order.totalCents,
    issuedAt,
    dueAt: new Date(issuedAt.getTime() + parsed.data.dueDays * 86_400_000),
    notes: parsed.data.notes,
  };

  for (let attempt = 0; ; attempt++) {
    try {
      const invoice = await prisma.$transaction(async (tx) =>
        tx.invoice.create({ data: { ...data, number: await nextInvoiceNumber(tx, issuedAt.getFullYear()) } })
      );
      return NextResponse.json({ id: invoice.id, number: invoice.number });
    } catch (e) {
      // Two admins took the same number; the second one tries the next.
      if (attempt === 0 && e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
}
