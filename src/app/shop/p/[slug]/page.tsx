import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { getDisplayCurrency } from "@/lib/currency.server";
import { BASE_CURRENCY } from "@/lib/currency";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return { title: "Product" };
  return {
    title: `${p.name} — ${p.brand}`,
    description: p.description.slice(0, 160),
    openGraph: { images: p.imageUrl ? [p.imageUrl] : [] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const currency = getDisplayCurrency();
  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { supplier: { include: { supplierProfile: true } }, category: { include: { parent: true } } },
  });
  if (!p || p.status !== "ACTIVE") notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: p.categoryId, status: "ACTIVE", NOT: { id: p.id } },
    take: 4,
  });

  const productLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.name,
    image: p.imageUrl ? [p.imageUrl] : [],
    description: p.description,
    sku: p.sku,
    brand: { "@type": "Brand", name: p.brand },
    offers: {
      "@type": "Offer",
      // Always the settlement currency, never the viewer's display choice.
      priceCurrency: BASE_CURRENCY,
      price: (p.priceCents / 100).toFixed(2),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/shop" className="hover:text-slate-900">Shop</Link>
        {p.category.parent && <> / <Link href={`/shop/c/${p.category.parent.slug}`} className="hover:text-slate-900">{p.category.parent.name}</Link></>}
        {" / "}<Link href={`/shop/c/${p.category.slug}`} className="hover:text-slate-900">{p.category.name}</Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="card aspect-square overflow-hidden p-0">
          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-400">No image</div>}
        </div>
        <div>
          <div className="text-sm uppercase tracking-wide text-slate-500">{p.brand}</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight">{p.name}</h1>
          <div className="mt-2 text-sm text-slate-600">SKU: {p.sku}</div>
          <div className="mt-6 text-4xl font-black text-amber">{formatCents(p.priceCents, currency)}</div>
          {currency !== BASE_CURRENCY && (
            <div className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              Indicative — charged as {formatCents(p.priceCents)} {BASE_CURRENCY}
            </div>
          )}
          <div className="mt-1 text-sm text-slate-600">{p.stock > 0 ? `${p.stock} in stock — ships from ${p.supplier.city ?? "supplier"}` : "Backorder available"}</div>

          <div className="mt-6">
            <AddToCartButton productId={p.id} maxStock={p.stock} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-sm">
            <div className="text-slate-600">Sold by</div>
            <div className="mt-1 font-bold">{p.supplier.supplierProfile?.businessName || p.supplier.name}</div>
            {p.supplier.supplierProfile?.approved && <span className="badge mt-1 bg-amber/20 text-amber">Verified Supplier</span>}
            {p.supplier.supplierProfile?.description && <p className="mt-2 text-slate-700">{p.supplier.supplierProfile.description}</p>}
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="mb-2 font-bold">Description</h2>
          <p className="whitespace-pre-line text-slate-700">{p.description}</p>
        </div>
        <div className="card">
          <h3 className="mb-3 font-bold">B2B benefits</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>Free shipping on orders over $500</li>
            <li>Net 30 terms available for approved accounts</li>
            <li>Volume discounts on case orders — contact supplier</li>
            <li>Direct fulfillment by verified industrial suppliers</li>
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 font-bold">Related products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link key={r.id} href={`/shop/p/${r.slug}`} className="card group flex flex-col overflow-hidden p-0 transition hover:border-amber/40">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">{r.imageUrl && <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover transition group-hover:scale-105" />}</div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="line-clamp-2 text-sm font-bold leading-tight">{r.name}</h3>
                  <div className="mt-auto pt-2 text-amber font-black">{formatCents(r.priceCents, currency)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
