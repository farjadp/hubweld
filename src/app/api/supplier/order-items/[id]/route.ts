import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ status: z.enum(["PENDING", "FULFILLED", "CANCELLED"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const item = await prisma.orderItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.supplierId !== me.id && me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.orderItem.update({ where: { id: item.id }, data: { status: parsed.data.status } });

  // Auto-update order status if all items fulfilled
  const allItems = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
  const allFulfilled = allItems.every((i) => (i.id === item.id ? parsed.data.status === "FULFILLED" : i.status === "FULFILLED"));
  if (allFulfilled) {
    await prisma.order.update({ where: { id: item.orderId }, data: { status: "SHIPPED" } });
  }

  return NextResponse.json({ ok: true });
}
