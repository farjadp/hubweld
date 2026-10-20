import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toOrderSummary } from "@/lib/api-dto";
import type { OrderSummary } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** The signed-in buyer's orders, newest first. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { buyerId: me.id },
    include: { items: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  const body: OrderSummary[] = orders.map(toOrderSummary);
  return NextResponse.json(body);
}
