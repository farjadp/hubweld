import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import AdminProductRow from "./AdminProductRow";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect("/login?callbackUrl=/admin/products");
  if (me.role !== "ADMIN") redirect("/dashboard");

  const q = (searchParams.q || "").trim();
  const status = searchParams.status;
  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { brand: { contains: q } }] } : {},
        status && ["DRAFT", "ACTIVE", "ARCHIVED"].includes(status) ? { status: status as any } : {},
      ],
    },
    include: { supplier: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Products</h1>
          <p className="text-white/60">{products.length} listings shown.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary shrink-0">+ New Product</Link>
      </div>
      <form className="card mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]"><label className="label">Search</label><input className="input" name="q" defaultValue={q} placeholder="Name, SKU, brand" /></div>
        <div><label className="label">Status</label>
          <select name="status" defaultValue={status || ""} className="input">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <button className="btn-primary">Filter</button>
      </form>
      <ul className="grid gap-2">
        {products.map((p: any) => (
          <AdminProductRow key={p.id} product={{
            id: p.id, name: p.name, slug: p.slug, sku: p.sku, status: p.status,
            priceCents: p.priceCents, stock: p.stock, supplierName: p.supplier.name,
            categoryName: p.category.name, imageUrl: p.imageUrl,
          }} formattedPrice={formatCents(p.priceCents)} />
        ))}
      </ul>
    </div>
  );
}
