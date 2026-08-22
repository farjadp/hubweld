import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SupplierProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/supplier/products");
  const me = session.user as any;
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") redirect("/dashboard");

  const products = await prisma.product.findMany({
    where: { supplierId: me.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My products</h1>
          <p className="text-slate-600">{products.length} listings</p>
        </div>
        <Link href="/dashboard/supplier/products/new" className="btn-primary">+ New product</Link>
      </div>
      {products.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-700">You haven't listed any products yet.</p>
          <Link href="/dashboard/supplier/products/new" className="btn-primary mt-4 inline-block">List your first product</Link>
        </div>
      ) : (
        <ul className="grid gap-2">
          {products.map((p) => (
            <li key={p.id} className="card flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">{p.imageUrl && <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
              <div className="flex-1 min-w-0">
                <Link href={`/shop/p/${p.slug}`} className="font-bold hover:text-amber line-clamp-1">{p.name}</Link>
                <div className="text-xs text-slate-600">{p.category.name} · SKU {p.sku} · Stock {p.stock}</div>
              </div>
              <div className="text-right">
                <div className="font-black">{formatCents(p.priceCents)}</div>
                <div className="text-xs"><span className={`badge ${p.status === "ACTIVE" ? "bg-amber/20 text-amber" : "bg-slate-100"}`}>{p.status}</span></div>
              </div>
              <Link href={`/dashboard/supplier/products/${p.id}/edit`} className="btn-secondary text-xs">Edit</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
