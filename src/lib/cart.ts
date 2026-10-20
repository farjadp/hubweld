import { prisma } from "@/lib/prisma";

// cartTotals now lives in lib/totals.ts so client components can recompute a
// total as the buyer types their address. Re-exported for existing callers.
export { cartTotals, type Totals, type Destination } from "@/lib/totals";

export async function getOrCreateCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { items: { include: { product: true } } },
  });
  return cart;
}

export async function cartItemCount(userId: string | undefined) {
  if (!userId) return 0;
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  return cart?.items.reduce((a, i) => a + i.quantity, 0) ?? 0;
}
