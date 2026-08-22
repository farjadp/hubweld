import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SupplierDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/supplier");
  const me = session.user as any;
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") redirect("/dashboard");

  const [profile, productCount, activeCount, recentItems, allPaidItems] = await Promise.all([
    prisma.supplierProfile.findUnique({ where: { userId: me.id } }),
    prisma.product.count({ where: { supplierId: me.id } }),
    prisma.product.count({ where: { supplierId: me.id, status: "ACTIVE" } }),
    prisma.orderItem.findMany({
      where: { supplierId: me.id },
      include: { order: true },
      orderBy: { order: { createdAt: "desc" } },
      take: 5,
    }),
    prisma.orderItem.findMany({
      where: { supplierId: me.id, order: { status: { in: ["PAID", "SHIPPED", "COMPLETED"] } } },
      select: { priceCents: true, quantity: true },
    }),
  ]);
  const totalRevenue = allPaidItems.reduce((a: number, i: { priceCents: number; quantity: number }) => a + i.priceCents * i.quantity, 0);
  const totalUnits = allPaidItems.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{profile?.businessName || me.name}</h1>
          <p className="text-slate-600">Supplier dashboard {profile?.approved ? <span className="badge ml-2 bg-amber/20 text-amber">Verified</span> : <span className="badge ml-2 bg-slate-100">Pending verification</span>}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/supplier/products" className="btn-secondary text-sm">My products</Link>
          <Link href="/dashboard/supplier/products/new" className="btn-primary text-sm">+ New product</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Stat label="Total products" value={productCount} />
        <Stat label="Active listings" value={activeCount} />
        <Stat label="Items sold" value={totalUnits} />
        <Stat label="Gross revenue" value={formatCents(totalRevenue)} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">Recent orders</h2>
            <Link href="/dashboard/supplier/orders" className="text-sm text-amber hover:underline">View all</Link>
          </div>
          {recentItems.length === 0 ? (
            <div className="card text-center text-slate-600">No orders yet.</div>
          ) : (
            <ul className="grid gap-2">
              {recentItems.map((it) => (
                <li key={it.id} className="card flex items-center justify-between">
                  <div>
                    <Link href={`/dashboard/supplier/orders/${it.orderId}`} className="font-bold hover:text-amber line-clamp-1">{it.nameSnapshot}</Link>
                    <div className="text-xs text-slate-600">Order #{it.orderId.slice(-8).toUpperCase()} · Qty {it.quantity} · {new Date(it.order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black">{formatCents(it.priceCents * it.quantity)}</div>
                    <div className="text-xs text-slate-500">{it.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="mb-2 font-bold">Supplier profile</h2>
          {profile ? (
            <>
              <p className="text-sm text-slate-700">{profile.description || <em className="text-slate-500">No description yet.</em>}</p>
              <div className="mt-2 text-xs text-slate-500">{profile.website || "No website set"}</div>
            </>
          ) : <p className="text-sm text-slate-600">Profile not yet configured.</p>}
          {!profile?.approved && (
            <p className="mt-3 text-xs text-slate-500">Complete your profile, then contact an admin to request the Verified badge.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="card"><div className="text-3xl font-black">{value}</div><div className="text-sm text-slate-600">{label}</div></div>;
}
