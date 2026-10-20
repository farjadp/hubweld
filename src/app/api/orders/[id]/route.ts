import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toOrderDetail } from "@/lib/api-dto";

export const dynamic = "force-dynamic";

/** One order, for its buyer or an admin (same rule as /orders/[id]). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { supplier: { select: { name: true, supplierProfile: { select: { businessName: true } } } } } } },
  });
  // 404 rather than 403 for someone else's order: no confirming it exists.
  if (!order || (order.buyerId !== me.id && me.role !== "ADMIN")) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(toOrderDetail(order));
}
