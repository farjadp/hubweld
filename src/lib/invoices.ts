import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export const PAYMENT_METHODS = ["EXCHANGE", "BANK_TRANSFER", "CARD", "CASH", "OTHER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  EXCHANGE: "Exchange house",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CASH: "Cash",
  OTHER: "Other",
};

/**
 * The next number in this year's sequence: INV-2026-0001, INV-2026-0002, …
 *
 * Read and written in the same transaction; the unique index on `number` is
 * what actually stops two admins issuing the same one, so callers retry once
 * on a conflict.
 */
export async function nextInvoiceNumber(tx: Tx, year = new Date().getFullYear()): Promise<string> {
  const prefix = `INV-${year}-`;
  const last = await tx.invoice.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

/**
 * After a payment: close the invoice once it is covered, and move a PENDING
 * order to PAID. An order that already shipped (Net 30, or paid after
 * delivery) keeps its fulfilment status — PAID is a step before shipping, not
 * a flag on top of it.
 */
export async function settleInvoice(tx: Tx, invoiceId: string): Promise<{ paidCents: number; settled: boolean }> {
  const inv = await tx.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { payments: { select: { amountCents: true } }, order: { select: { id: true, status: true } } },
  });
  const paidCents = inv.payments.reduce((a, p) => a + p.amountCents, 0);
  const settled = paidCents >= inv.amountCents;
  if (settled && inv.status !== "PAID") {
    await tx.invoice.update({ where: { id: inv.id }, data: { status: "PAID" } });
    if (inv.order.status === "PENDING") {
      await tx.order.update({ where: { id: inv.order.id }, data: { status: "PAID" } });
    }
  }
  return { paidCents, settled };
}
