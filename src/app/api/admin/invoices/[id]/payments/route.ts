import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { PAYMENT_METHODS, settleInvoice } from "@/lib/invoices";

const schema = z
  .object({
    method: z.enum(PAYMENT_METHODS),
    amountCents: z.number().int().positive(),
    paidAt: z.coerce.date(),
    exchangeName: z.string().max(200).default(""),
    exchangeBranch: z.string().max(200).default(""),
    exchangeCountry: z.string().max(100).default(""),
    localCurrency: z.string().max(3).default("").transform((s) => s.toUpperCase()),
    localAmount: z.number().positive().nullable().optional(),
    localFee: z.number().min(0).nullable().optional(),
    rate: z.number().positive().nullable().optional(),
    reference: z.string().max(200).default(""),
    notes: z.string().max(2000).default(""),
  })
  // Without the house and the havaleh reference nobody can trace the money later.
  .refine((d) => d.method !== "EXCHANGE" || (d.exchangeName.trim() && d.reference.trim()), {
    message: "An exchange-house payment needs the exchange name and the transfer reference.",
  })
  .refine((d) => d.paidAt.getTime() <= Date.now() + 86_400_000, { message: "Payment date is in the future." });

/** Record money received against an invoice — the admin "mark as paid". */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await requireAdmin();
  if (!me) return forbidden();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Invalid input";
    return NextResponse.json({ error: msg, details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { payments: { select: { amountCents: true } }, order: { select: { status: true } } },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status !== "ISSUED") return NextResponse.json({ error: `Invoice is ${invoice.status.toLowerCase()}` }, { status: 400 });
  if (invoice.order.status === "CANCELLED") return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });

  const outstanding = invoice.amountCents - invoice.payments.reduce((a, p) => a + p.amountCents, 0);
  if (d.amountCents > outstanding) {
    return NextResponse.json({ error: `Only ${(outstanding / 100).toFixed(2)} CAD is outstanding on this invoice` }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        method: d.method,
        amountCents: d.amountCents,
        paidAt: d.paidAt,
        exchangeName: d.exchangeName.trim(),
        exchangeBranch: d.exchangeBranch.trim(),
        exchangeCountry: d.exchangeCountry.trim(),
        localCurrency: d.localCurrency,
        localAmount: d.localAmount ?? null,
        localFee: d.localFee ?? null,
        rate: d.rate ?? null,
        reference: d.reference.trim(),
        notes: d.notes,
        recordedById: me.id,
      },
    });
    return settleInvoice(tx, invoice.id);
  });
  return NextResponse.json(result);
}
