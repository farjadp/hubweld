import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { orderReference } from "@/lib/api-dto";
import type { SupplierOrderLine } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/**
 * Order lines this supplier has to fulfil, newest order first. Each line is
 * updated through POST /api/supplier/order-items/[id].
 */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") return NextResponse.json({ error: "Suppliers only" }, { status: 403 });

  const items = await prisma.orderItem.findMany({
    where: { supplierId: me.id },
    include: { order: { include: { buyer: { select: { name: true } } } } },
    orderBy: { order: { createdAt: "desc" } },
  });
  const body: SupplierOrderLine[] = items.map((it) => ({
    id: it.id,
    orderId: it.orderId,
    reference: orderReference(it.orderId),
    name: it.nameSnapshot,
    priceCents: it.priceCents,
    quantity: it.quantity,
    status: it.status as SupplierOrderLine["status"],
    orderStatus: it.order.status as SupplierOrderLine["orderStatus"],
    buyerName: it.order.buyer.name,
    shipTo: [it.order.shipCity, it.order.shipRegion, it.order.shipCountry].filter(Boolean).join(", "),
    createdAt: it.order.createdAt.toISOString(),
  }));
  return NextResponse.json(body);
}
