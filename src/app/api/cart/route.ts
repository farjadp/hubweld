import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

const schema = z.object({ productId: z.string(), quantity: z.number().int().min(1).max(999) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
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

export async function GET() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ items: [] });
  const cart = await getOrCreateCart(me.id);
  return NextResponse.json({
    items: cart.items.map((i) => ({ id: i.id, productId: i.productId, name: i.product.name, priceCents: i.product.priceCents, quantity: i.quantity, imageUrl: i.product.imageUrl, slug: i.product.slug })),
  });
}
