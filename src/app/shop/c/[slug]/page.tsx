import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { getDisplayCurrency } from "@/lib/currency.server";
import { ShopSidebar } from "../../ShopSidebar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const cat = await prisma.productCategory.findUnique({ where: { slug: params.slug } });
  if (!cat) return { title: "Category" };
  return { title: `${cat.name} — HubWeld Shop`, description: `Browse ${cat.name} from verified welding suppliers.` };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const currency = getDisplayCurrency();
  const cat = await prisma.productCategory.findUnique({
    where: { slug: params.slug },
    include: { children: true, parent: true },
  });
  if (!cat) notFound();

  const childIds = cat.children.map((c) => c.id);
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId: { in: [cat.id, ...childIds] } },
    include: { supplier: true, category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const categories = await prisma.productCategory.findMany({ where: { parentId: null }, include: { children: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <ShopSidebar categories={categories} activeSlug={cat.slug} />
      <section>
        <nav className="mb-2 text-xs text-slate-500">
          <Link href="/shop" className="hover:text-slate-900">Shop</Link>
          {cat.parent && <> / <Link href={`/shop/c/${cat.parent.slug}`} className="hover:text-slate-900">{cat.parent.name}</Link></>}
          {" / "}<span className="text-slate-900">{cat.name}</span>
        </nav>
        <h1 className="mb-1 text-3xl font-black tracking-tight">{cat.name}</h1>
        <p className="mb-6 text-slate-600">{products.length} {products.length === 1 ? "product" : "products"}</p>
        {products.length === 0 ? (
          <div className="card text-center text-slate-600">No products in this category yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link key={p.id} href={`/shop/p/${p.slug}`} className="card group flex flex-col overflow-hidden p-0 transition hover:border-amber/40">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" /> : null}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{p.brand}</div>
                  <h3 className="line-clamp-2 font-bold leading-tight">{p.name}</h3>
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-lg font-black text-amber">{formatCents(p.priceCents, currency)}</span>
                    <span className="text-xs text-slate-500">{p.stock > 0 ? "In stock" : "Backorder"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
