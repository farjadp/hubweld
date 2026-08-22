import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import FulfillButton from "./FulfillButton";

export const dynamic = "force-dynamic";

export default async function SupplierOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const me = session.user as any;
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") redirect("/dashboard");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { buyer: true, items: true },
  });
  if (!order) notFound();
  const myItems = order.items.filter((i) => i.supplierId === me.id || me.role === "ADMIN");
  if (myItems.length === 0) redirect("/dashboard/supplier/orders");

  return (
    <div>
      <Link href="/dashboard/supplier/orders" className="text-sm text-slate-500 hover:text-slate-900">← All orders</Link>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
      <p className="text-sm text-slate-600">Placed {new Date(order.createdAt).toLocaleString()} · Buyer: {order.buyer.name}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        <ul className="grid gap-3">
          {myItems.map((it) => (
            <li key={it.id} className="card flex items-center justify-between gap-4">
              <div>
                <div className="font-bold">{it.nameSnapshot}</div>
                <div className="text-xs text-slate-600">Qty {it.quantity} · {formatCents(it.priceCents)} each</div>
                <div className="text-xs text-slate-500">Status: {it.status}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black">{formatCents(it.priceCents * it.quantity)}</span>
                <FulfillButton itemId={it.id} status={it.status} />
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit space-y-1 text-sm">
          <h3 className="mb-2 font-bold">Ship to</h3>
          <div>{order.shipName}{order.shipCompany ? ` · ${order.shipCompany}` : ""}</div>
          <div>{order.shipAddress}</div>
          <div>{order.shipCity}{order.shipRegion ? `, ${order.shipRegion}` : ""} {order.shipPostal}</div>
          <div>{order.shipCountry}</div>
          {order.shipPhone && <div>{order.shipPhone}</div>}
          {order.notes && <><div className="mt-3 font-bold text-slate-700">Notes</div><div className="text-slate-700">{order.notes}</div></>}
        </aside>
      </div>
    </div>
  );
}
