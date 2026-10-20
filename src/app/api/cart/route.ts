import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import type { CartResponse } from "@/lib/api-types";

const schema = z.object({ productId: z.string(), quantity: z.number().int().min(1).max(999) });

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { productId, quantity } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") return NextResponse.json({ error: "Product unavailable" }, { status: 404 });

  const cart = await getOrCreateCart(me.id);
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";

/**
 * The cart. With `?country=` (and `?region=` for a Canadian province) it also
 * returns the shipping and tax estimate from the same cartTotals() checkout
 * records, so the app never computes tax on its own.
 */
export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ items: [] } satisfies CartResponse);
  const cart = await getOrCreateCart(me.id);
  const url = new URL(req.url);
  const country = url.searchParams.get("country");

  const body: CartResponse = {
    items: cart.items.map((i) => ({ id: i.id, productId: i.productId, name: i.product.name, priceCents: i.product.priceCents, quantity: i.quantity, imageUrl: i.product.imageUrl, slug: i.product.slug, stock: i.product.stock })),
  };
  if (country !== null) {
    const t = cartTotals(
      cart.items.map((i) => ({ priceCents: i.product.priceCents, quantity: i.quantity })),
      { country, region: url.searchParams.get("region") ?? "" }
    );
    body.totals = {
      subtotalCents: t.subtotalCents,
      shippingCents: t.shippingCents,
      taxCents: t.taxCents,
      totalCents: t.totalCents,
      taxLabel: t.tax.label,
      taxResolved: t.tax.resolved,
    };
  }
  return NextResponse.json(body);
}
