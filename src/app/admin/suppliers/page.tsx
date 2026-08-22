import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import SupplierRow from "./SupplierRow";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect("/login?callbackUrl=/admin/suppliers");
  if (me.role !== "ADMIN") redirect("/dashboard");

  const profiles = await prisma.supplierProfile.findMany({
    include: { user: true },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
  });
  const productCounts = await prisma.product.groupBy({
    by: ["supplierId"], _count: { _all: true },
  });
  const countMap = new Map<string, number>(productCounts.map((c: any) => [c.supplierId, c._count._all]));

  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-500">{profiles.length} suppliers · approve verified vendor badges</p>
        </div>
        <Link href="/admin/suppliers/new" className="btn-primary shrink-0">+ New Supplier</Link>
      </div>
      <ul className="grid gap-2">
        {profiles.map((p: any) => (
          <SupplierRow key={p.id} profile={{
            id: p.id, businessName: p.businessName, description: p.description,
            website: p.website, approved: p.approved, userName: p.user.name,
            userEmail: p.user.email, products: countMap.get(p.userId) ?? 0,
          }} />
        ))}
      </ul>
    </div>
  );
}
