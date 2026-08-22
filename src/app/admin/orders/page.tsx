import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect("/login?callbackUrl=/admin/orders");
  if (me.role !== "ADMIN") redirect("/dashboard");

  const orders = await prisma.order.findMany({
    include: { buyer: true, _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statusColor: Record<string, string> = {
    PENDING:    "bg-amber-600/15 text-amber-700 border-amber-600/25",
    PAID:       "bg-green-600/15 text-green-700 border-green-600/30",
    SHIPPED:    "bg-blue-600/15 text-blue-700 border-blue-600/25",
    DELIVERED:  "bg-slate-100 text-slate-500 border-slate-200",
    CANCELLED:  "bg-red-600/15 text-brand border-red-600/25",
  };
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">{orders.length} most recent orders</p>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">No orders yet.</div>
      ) : (
        <ul className="grid gap-2">
          {orders.map((o: any) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 transition-colors">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/orders/${o.id}`} className="font-black text-slate-900 hover:text-brand transition-colors">
                    #{o.id.slice(-8).toUpperCase()}
                  </Link>
                  <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusColor[o.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {o.status}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {o.buyer.name} · {o.buyer.email} · {o._count.items} items · {new Date(o.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">{o.shipCity}, {o.shipRegion} {o.shipCountry}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-slate-900">{formatCents(o.totalCents)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
