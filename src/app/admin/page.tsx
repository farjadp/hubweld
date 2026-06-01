import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Briefcase, Store, Package, ShoppingBag, MessageSquare, ArrowRight, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect("/login?callbackUrl=/admin");
  if (me.role !== "ADMIN") redirect("/dashboard");

  const [users, jobs, bids, welders, suppliers, products, orders, pendingSuppliers] = await Promise.all([
    prisma.user.count(), prisma.job.count(), prisma.bid.count(),
    prisma.user.count({ where: { role: "WELDER" } }),
    prisma.user.count({ where: { role: "SUPPLIER" } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.supplierProfile.count({ where: { approved: false } }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white">Admin Overview</h1>
        <p className="mt-1 text-sm text-white/40">Platform health and quick actions.</p>
      </div>

      {pendingSuppliers > 0 && (
        <Link href="/admin/suppliers" className="mb-6 flex items-center gap-3 rounded-xl border border-red-600/30 bg-red-600/10 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-600/15 transition-colors">
          <AlertCircle size={16} />
          {pendingSuppliers} supplier{pendingSuppliers > 1 ? "s" : ""} pending approval
          <ArrowRight size={14} className="ml-auto" />
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={users} icon={Users} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" />
        <StatCard label="Welders" value={welders} icon={Users} color="text-red-400" bg="bg-red-500/10 border-red-500/20" />
        <StatCard label="Suppliers" value={suppliers} icon={Store} color="text-amber-400" bg="bg-amber-500/10 border-amber-500/20" />
        <StatCard label="Jobs Posted" value={jobs} icon={Briefcase} color="text-green-400" bg="bg-green-500/10 border-green-500/20" />
        <StatCard label="Bids Placed" value={bids} icon={MessageSquare} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/20" />
        <StatCard label="Products" value={products} icon={Package} color="text-cyan-400" bg="bg-cyan-500/10 border-cyan-500/20" />
        <StatCard label="Orders" value={orders} icon={ShoppingBag} color="text-orange-400" bg="bg-orange-500/10 border-orange-500/20" />
        <StatCard label="Pending Suppliers" value={pendingSuppliers} icon={AlertCircle} color="text-red-400" bg="bg-red-500/10 border-red-500/20" highlight={pendingSuppliers > 0} />
      </div>

      {/* Quick nav */}
      <h2 className="mb-4 mt-10 text-xs font-black uppercase tracking-widest text-white/30">Manage</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/users", label: "Users", desc: "Approve welders, change roles, ban abusers.", icon: Users },
          { href: "/admin/jobs", label: "Jobs", desc: "Moderate or remove job postings.", icon: Briefcase },
          { href: "/admin/suppliers", label: "Suppliers", desc: "Approve verified vendor badges.", icon: Store },
          { href: "/admin/products", label: "Products", desc: "Moderate marketplace listings.", icon: Package },
          { href: "/admin/orders", label: "Orders", desc: "View and manage all platform orders.", icon: ShoppingBag },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="group flex items-start gap-4 rounded-xl border border-white/10 bg-[#111315] p-5 transition-all hover:border-red-600/30 hover:bg-[#161819]">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-600/10 text-red-400 border border-red-600/20">
              <Icon size={17} />
            </div>
            <div>
              <div className="font-bold text-white group-hover:text-red-400 transition-colors">{label}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-white/40">{desc}</div>
            </div>
            <ArrowRight size={14} className="ml-auto mt-1 shrink-0 text-white/20 group-hover:text-red-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, highlight }: {
  label: string; value: number; icon: any; color: string; bg: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-red-600/40 bg-red-600/10" : "border-white/10 bg-[#111315]"}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</span>
        <Icon size={15} className={color} />
      </div>
      <div className={`text-3xl font-black ${highlight ? "text-red-400" : "text-white"}`}>{value}</div>
    </div>
  );
}
