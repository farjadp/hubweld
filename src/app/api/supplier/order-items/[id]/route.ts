import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restoreStockFor, orderStatusFromItems } from "@/lib/orders";

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

  const next = parsed.data.status;
  if (next === item.status) return NextResponse.json({ ok: true });

  // A cancelled order has already had its stock returned, and a completed one
  // is closed. Touching a line on either would double-count the inventory.
  const parent = await prisma.order.findUnique({
    where: { id: item.orderId },
    select: { status: true },
  });
  if (parent?.status === "CANCELLED") {
    return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
  }
  if (parent?.status === "COMPLETED") {
    return NextResponse.json({ error: "This order is already complete" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.update({ where: { id: item.id }, data: { status: next } });

    // Cancelling a line releases its units; un-cancelling takes them again.
    if (next === "CANCELLED" && item.status !== "CANCELLED") {
      await restoreStockFor(tx, [item]);
    } else if (item.status === "CANCELLED" && next !== "CANCELLED") {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Roll the order status up from its items. A cancelled line used to block
    // this forever, leaving a shipped order stuck at PENDING.
    const siblings = await tx.orderItem.findMany({
      where: { orderId: item.orderId },
      select: { status: true },
    });
    const rolled = orderStatusFromItems(siblings.map((s) => s.status));
    if (rolled) {
      const order = await tx.order.findUnique({ where: { id: item.orderId }, select: { status: true } });
      // Never walk back a finished order.
      if (order && order.status !== "COMPLETED" && order.status !== rolled) {
        await tx.order.update({ where: { id: item.orderId }, data: { status: rolled } });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
