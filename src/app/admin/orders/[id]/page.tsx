import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import CancelOrderButton from "@/app/orders/[id]/CancelOrderButton";
import InvoicePanel, { type InvoiceData } from "./InvoicePanel";

export const dynamic = "force-dynamic";

/** One order for ops: what was bought, where it ships, and the money trail. */
export default async function AdminOrderPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect(`/login?callbackUrl=/admin/orders/${params.id}`);
  if (me.role !== "ADMIN") redirect("/dashboard");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      buyer: { select: { name: true, email: true, phone: true } },
      items: { include: { supplier: { select: { name: true, supplierProfile: { select: { businessName: true } } } } } },
      invoices: {
        orderBy: { issuedAt: "desc" },
        include: { payments: { orderBy: { paidAt: "asc" }, include: { recordedBy: { select: { name: true } } } } },
      },
    },
  });
  if (!order) notFound();

  // What is still owed once cancelled lines are taken out. A cancelled line on
  // a paid order is money to give back; ops needs to see that, not a stale total.
  const liveCents = order.items.filter((i) => i.status !== "CANCELLED").reduce((a, i) => a + i.priceCents * i.quantity, 0);
  const cancelledCents = order.subtotalCents - liveCents;

  const invoices: InvoiceData[] = order.invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    amountCents: inv.amountCents,
    status: inv.status,
    issuedAt: inv.issuedAt.toISOString(),
    dueAt: inv.dueAt?.toISOString() ?? null,
    notes: inv.notes,
    payments: inv.payments.map((p) => ({
      id: p.id,
      method: p.method,
      amountCents: p.amountCents,
      paidAt: p.paidAt.toISOString(),
      exchangeName: p.exchangeName,
      exchangeBranch: p.exchangeBranch,
      exchangeCountry: p.exchangeCountry,
      localCurrency: p.localCurrency,
      localAmount: p.localAmount,
      localFee: p.localFee,
      rate: p.rate,
      reference: p.reference,
      notes: p.notes,
      recordedBy: p.recordedBy.name,
    })),
  }));

  return (
    <div className="max-w-5xl">
      <Link href="/admin/orders" className="text-sm text-slate-500 hover:text-slate-900">← All orders</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-slate-500">
            {order.buyer.name} · {order.buyer.email} · placed {order.createdAt.toLocaleString("en-CA")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-slate-100 text-slate-700">{order.status}</span>
          {order.paymentMethod === "net30" && <span className="badge bg-blue-600/10 text-blue-700">Net 30</span>}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <InvoicePanel
            orderId={order.id}
            orderStatus={order.status}
            orderTotalCents={order.totalCents}
            shipCountry={order.shipCountry}
            invoices={invoices}
          />

          <section className="card p-5">
            <h2 className="mb-3 font-bold text-slate-900">Items</h2>
            <ul className="divide-y divide-slate-100">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <div>
                    <div className={`font-semibold ${it.status === "CANCELLED" ? "text-slate-400 line-through" : "text-slate-900"}`}>{it.nameSnapshot}</div>
                    <div className="text-xs text-slate-500">
                      {it.supplier.supplierProfile?.businessName || it.supplier.name} · Qty {it.quantity} · {it.status}
                    </div>
                  </div>
                  <div className="font-mono font-semibold">{formatCents(it.priceCents * it.quantity)}</div>
                </li>
              ))}
            </ul>
            {cancelledCents > 0 && (
              <p className="mt-3 rounded-sm border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {formatCents(cancelledCents)} of goods (before tax and shipping) were cancelled after checkout. The order total below
                still includes them — invoice the reduced amount, or refund it if this order is already paid.
              </p>
            )}
          </section>
        </div>

        <aside className="card h-fit space-y-2 p-5 text-sm">
          <h3 className="mb-2 font-bold">Summary</h3>
          <Row label="Subtotal" value={formatCents(order.subtotalCents)} />
          <Row label="Shipping" value={formatCents(order.shippingCents)} />
          <Row label="Tax" value={formatCents(order.taxCents)} />
          <div className="my-2 h-px bg-slate-100" />
          <Row label="Total" value={formatCents(order.totalCents)} bold />
          <div className="mt-4 text-xs text-slate-600">
            <div className="mb-1 font-bold text-slate-700">Ship to</div>
            <div>{order.shipName}{order.shipCompany ? ` · ${order.shipCompany}` : ""}</div>
            <div>{order.shipAddress}</div>
            <div>{order.shipCity}{order.shipRegion ? `, ${order.shipRegion}` : ""} {order.shipPostal}</div>
            <div>{order.shipCountry}</div>
            {order.shipPhone && <div>{order.shipPhone}</div>}
          </div>
          {order.notes && (
            <div className="mt-4 text-xs text-slate-600">
              <div className="mb-1 font-bold text-slate-700">Buyer notes</div>
              <p className="whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <CancelOrderButton orderId={order.id} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-black" : "text-slate-700"}`}>
      <span>{label}</span><span className="text-slate-900">{value}</span>
    </div>
  );
}
