import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/orders");
  const me = session.user as any;
  const orders = await prisma.order.findMany({
    where: { buyerId: me.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black tracking-tight">My orders</h1>
      {orders.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-700">No orders yet.</p>
          <Link href="/shop" className="btn-primary mt-4 inline-block">Browse the shop</Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {orders.map((o) => (
            <li key={o.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/orders/${o.id}`} className="font-bold hover:text-amber">Order #{o.id.slice(-8).toUpperCase()}</Link>
                  <div className="text-xs text-slate-600">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-slate-100">{o.status}</span>
                  <span className="font-black">{formatCents(o.totalCents)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
