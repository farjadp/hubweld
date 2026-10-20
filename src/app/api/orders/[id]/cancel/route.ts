import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { notifyUsers } from "@/lib/push";
import { orderReference } from "@/lib/api-dto";
import { restoreStockFor } from "@/lib/orders";

/**
 * Cancel an order and give the stock back.
 *
 * Checkout decrements stock the moment an order is recorded, but no gateway is
 * connected so orders sit at PENDING until someone settles them by phone.
 * There was no way to cancel one — not for the buyer, not for an admin — so
 * every abandoned order held its stock out of the catalogue permanently.
 *
 * A buyer may cancel while nothing has shipped. An admin may cancel anything
 * that is not already COMPLETED.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isAdmin = me.role === "ADMIN";
  const isBuyer = order.buyerId === me.id;
  if (!isBuyer && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (order.status === "CANCELLED") {
    return NextResponse.json({ error: "This order is already cancelled" }, { status: 400 });
  }
  if (order.status === "COMPLETED") {
    return NextResponse.json({ error: "A completed order cannot be cancelled" }, { status: 400 });
  }
  // Once anything has gone out the door the buyer has to talk to us.
  if (!isAdmin && order.status !== "PENDING") {
    return NextResponse.json(
      { error: "This order is already being fulfilled. Contact us and we will sort it out." },
      { status: 400 }
    );
  }

  const live = order.items.filter((i) => i.status !== "CANCELLED");

  await prisma.$transaction(async (tx) => {
    await restoreStockFor(tx, live);
    await tx.orderItem.updateMany({
      where: { orderId: order.id, status: { not: "CANCELLED" } },
      data: { status: "CANCELLED" },
    });
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  });

  const ref = orderReference(order.id);
  notifyUsers(
    [...new Set(live.map((i) => i.supplierId))].filter((id) => id !== me.id),
    { title: `Order ${ref} cancelled`, body: "Do not ship it. The stock has been returned.", data: { type: "supplier-order", orderId: order.id } }
  );
  if (!isBuyer) {
    notifyUsers(order.buyerId, { title: `Order ${ref} cancelled`, body: "HubWeld cancelled this order.", data: { type: "order", orderId: order.id } });
  }

  return NextResponse.json({ ok: true });
}
