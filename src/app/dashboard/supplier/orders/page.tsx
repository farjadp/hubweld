import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SupplierOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/supplier/orders");
  const me = session.user as any;
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") redirect("/dashboard");

  const items = await prisma.orderItem.findMany({
    where: { supplierId: me.id },
    include: { order: { include: { buyer: true } } },
    orderBy: { order: { createdAt: "desc" } },
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-black tracking-tight">Incoming orders</h1>
      <p className="mb-6 text-slate-600">{items.length} line items to fulfill</p>
      {items.length === 0 ? (
        <div className="card text-center text-slate-600">No orders yet.</div>
      ) : (
        <ul className="grid gap-2">
          {items.map((it) => (
            <li key={it.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/dashboard/supplier/orders/${it.orderId}`} className="font-bold hover:text-amber line-clamp-1">{it.nameSnapshot}</Link>
                <div className="text-xs text-slate-600">Order #{it.orderId.slice(-8).toUpperCase()} · Buyer: {it.order.buyer.name} · {new Date(it.order.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-slate-500">Ship to: {it.order.shipCity}, {it.order.shipRegion} {it.order.shipCountry}</div>
              </div>
              <div className="text-right">
                <div className="font-black">{formatCents(it.priceCents * it.quantity)}</div>
                <div className="text-xs text-slate-500">Qty {it.quantity}</div>
                <span className="badge mt-1 bg-slate-100 text-xs">{it.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
