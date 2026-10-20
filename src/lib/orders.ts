import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * Put the units from these order items back into stock.
 *
 * Checkout decrements stock when the order is recorded, so anything that
 * cancels has to put it back or the catalogue leaks inventory. Shared by the
 * whole-order cancel and the per-item supplier cancel so the two can never
 * drift apart.
 */
export async function restoreStockFor(
  tx: Tx,
  items: Array<{ productId: string; quantity: number }>
): Promise<void> {
  for (const i of items) {
    // The product may have been deleted since the order was placed; a missing
    // row must not roll back a legitimate cancellation.
    const exists = await tx.product.findUnique({ where: { id: i.productId }, select: { id: true } });
    if (!exists) continue;
    await tx.product.update({
      where: { id: i.productId },
      data: { stock: { increment: i.quantity } },
    });
  }
}

/**
 * The order status implied by its items.
 *
 * `null` means leave the order status alone — there is still something
 * outstanding. This exists because the old roll-up only looked for "every item
 * FULFILLED": one cancelled line meant the order could never reach SHIPPED,
 * and it sat at PENDING while the rest of it was already in transit.
 */
export function orderStatusFromItems(
  statuses: string[]
): "SHIPPED" | "CANCELLED" | null {
  if (statuses.length === 0) return null;
  if (statuses.some((s) => s === "PENDING")) return null;
  // Everything is settled one way or the other.
  if (statuses.every((s) => s === "CANCELLED")) return "CANCELLED";
  return "SHIPPED";
}
