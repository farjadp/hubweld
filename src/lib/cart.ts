import { prisma } from "@/lib/prisma";

export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    await prisma.cart.create({ data: { userId } });
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart!;
}

export function cartTotals(items: Array<{ priceCents: number; quantity: number }>) {
  const subtotalCents = items.reduce((a, i) => a + i.priceCents * i.quantity, 0);
  const shippingCents = subtotalCents === 0 ? 0 : subtotalCents >= 50000 ? 0 : 1500;
  const taxCents = Math.round(subtotalCents * 0.08);
  const totalCents = subtotalCents + shippingCents + taxCents;
  return { subtotalCents, shippingCents, taxCents, totalCents };
}

export async function cartItemCount(userId: string | undefined) {
  if (!userId) return 0;
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  return cart?.items.reduce((a, i) => a + i.quantity, 0) ?? 0;
}
