import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import ConfirmReceiptButton from "./ConfirmReceiptButton";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { success?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/orders/${params.id}`);
  const me = session.user as any;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { supplier: { include: { supplierProfile: true } } } } },
  });
  if (!order) notFound();
  if (order.buyerId !== me.id && me.role !== "ADMIN") redirect("/orders");

  return (
    <div>
      {searchParams.success && (
        <div className="card mb-6 border-amber-500/40 bg-amber-50">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-amber-900">Order request received</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-900/90">
            Your order is recorded and reserved, and a confirmation is on its way to your inbox.
            Card payments are temporarily unavailable while we reconnect our gateway, so
            <strong> nothing has been charged</strong> — our team will contact you shortly to confirm the
            order and arrange payment.
          </p>
        </div>
      )}

      <Link href="/orders" className="text-sm text-slate-500 hover:text-slate-900">← All orders</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-slate-600">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className="badge bg-slate-100">{order.status}</span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <ul className="grid gap-3">
          {order.items.map((it) => (
            <li key={it.id} className="card flex items-center justify-between gap-4">
              <div>
                <div className="font-bold">{it.nameSnapshot}</div>
                <div className="text-xs text-slate-600">From {it.supplier.supplierProfile?.businessName || it.supplier.name} · Qty {it.quantity}</div>
                <div className="text-xs text-slate-500">{it.status}</div>
              </div>
              <div className="font-black">{formatCents(it.priceCents * it.quantity)}</div>
            </li>
          ))}
        </ul>
        <aside className="card h-fit space-y-2 text-sm">
          <h3 className="mb-2 font-bold">Summary</h3>
          <Row label="Subtotal" value={formatCents(order.subtotalCents)} />
          <Row label="Shipping" value={formatCents(order.shippingCents)} />
          <Row label="Tax" value={formatCents(order.taxCents)} />
          <div className="my-2 h-px bg-slate-100" />
          <Row label="Total" value={formatCents(order.totalCents)} bold />
          <div className="mt-4 text-xs text-slate-600">
            <div className="mb-1 font-bold text-slate-700">Shipping to</div>
            <div>{order.shipName}{order.shipCompany ? ` · ${order.shipCompany}` : ""}</div>
            <div>{order.shipAddress}</div>
            <div>{order.shipCity}{order.shipRegion ? `, ${order.shipRegion}` : ""} {order.shipPostal}</div>
            <div>{order.shipCountry}</div>
            {order.shipPhone && <div>{order.shipPhone}</div>}
          </div>

          {/* Closes the loop: suppliers ship, the buyer confirms, the order ends. */}
          {order.buyerId === me.id && order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              {order.items.every((i) => i.status !== "PENDING") ? (
                <ConfirmReceiptButton orderId={order.id} />
              ) : (
                <p className="text-xs text-slate-500">
                  You can confirm receipt once every supplier has shipped their items.
                </p>
              )}
            </div>
          )}
          {order.status === "COMPLETED" && (
            <p className="mt-5 border-t border-slate-200 pt-4 text-xs font-semibold text-green-700">
              ✓ Receipt confirmed — this order is complete.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-black text-base" : "text-slate-700"}`}>
      <span>{label}</span><span className={bold ? "text-amber" : "text-slate-900"}>{value}</span>
    </div>
  );
}
