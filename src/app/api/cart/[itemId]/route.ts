import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ quantity: z.number().int().min(1).max(999) });

export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const item = await prisma.cartItem.findUnique({ where: { id: params.itemId }, include: { cart: true } });
  if (!item || item.cart.userId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: parsed.data.quantity } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { itemId: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const item = await prisma.cartItem.findUnique({ where: { id: params.itemId }, include: { cart: true } });
  if (!item || item.cart.userId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.cartItem.delete({ where: { id: item.id } });
  return NextResponse.json({ ok: true });
}
