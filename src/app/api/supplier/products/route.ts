import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toProductSummary } from "@/lib/api-dto";
import type { ProductSummary } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** Every product this supplier lists, drafts and archived included. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") return NextResponse.json({ error: "Suppliers only" }, { status: 403 });

  const products = await prisma.product.findMany({ where: { supplierId: me.id }, orderBy: { updatedAt: "desc" } });
  const body: (ProductSummary & { status: string })[] = products.map((p) => ({ ...toProductSummary(p), status: p.status }));
  return NextResponse.json(body);
}
