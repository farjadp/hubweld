import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Buyer confirms receipt, closing the order.
 *
 * Without this the order lifecycle dead-ended at SHIPPED: suppliers marked
 * their items fulfilled and nothing ever reached COMPLETED, so neither side
 * had a record of the transaction being finished.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { select: { status: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.buyerId !== me.id && me.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status === "COMPLETED") {
    return NextResponse.json({ error: "This order is already complete" }, { status: 400 });
  }
  if (order.status === "CANCELLED") {
    return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
  }

  const outstanding = order.items.filter((i) => i.status === "PENDING").length;
  if (outstanding > 0) {
    return NextResponse.json(
      { error: `${outstanding} item${outstanding === 1 ? "" : "s"} not shipped yet` },
      { status: 400 }
    );
  }

  await prisma.order.update({ where: { id: order.id }, data: { status: "COMPLETED" } });
  return NextResponse.json({ ok: true });
}
