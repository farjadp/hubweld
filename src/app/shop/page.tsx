import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { ShopSidebar } from "./ShopSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Welding Supplies — Machines, Consumables, Safety Gear",
  description: "B2B marketplace for welding equipment, consumables, safety gear, and shop supplies from verified suppliers.",
};

export default async function ShopPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || "";
  const [categories, featured, products] = await Promise.all([
    prisma.productCategory.findMany({ where: { parentId: null }, include: { children: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ where: { featured: true, status: "ACTIVE" }, take: 4, include: { supplier: true } }),
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        ...(q ? { OR: [{ name: { contains: q } }, { brand: { contains: q } }, { description: { contains: q } }] } : {}),
      },
      include: { supplier: true, category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 60,
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Welding Supplies Marketplace</h1>
        <p className="mt-2 max-w-2xl text-white/60">Machines, consumables, safety gear, and shop supplies from verified industrial suppliers. Net 30 available for approved buyers.</p>
        <form className="mt-4 flex gap-2" action="/shop">
          <input name="q" defaultValue={q} placeholder="Search products, brands, SKUs..." className="input flex-1" />
          <button className="btn-primary" type="submit">Search</button>
        </form>
      </div>

      {!q && featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 font-bold">Featured products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <ShopSidebar categories={categories} />
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{q ? `Results for "${q}"` : "All products"}</h2>
            <span className="text-sm text-white/60">{products.length} items</span>
          </div>
          {products.length === 0 ? (
            <div className="card text-center text-white/60">No products match your search.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: any }) {
  return (
    <Link href={`/shop/p/${p.slug}`} className="card group flex flex-col overflow-hidden p-0 transition hover:border-amber/40">
      <div className="aspect-[4/3] w-full overflow-hidden bg-white/5">
        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="grid h-full place-items-center text-white/30">No image</div>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="text-xs uppercase tracking-wide text-white/40">{p.brand}</div>
        <h3 className="line-clamp-2 font-bold leading-tight">{p.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-lg font-black text-amber">{formatCents(p.priceCents)}</span>
          <span className="text-xs text-white/50">{p.stock > 0 ? "In stock" : "Backorder"}</span>
        </div>
      </div>
    </Link>
  );
}
