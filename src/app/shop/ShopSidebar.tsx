import Link from "next/link";

type Cat = { id: string; slug: string; name: string; children: { id: string; slug: string; name: string }[] };

export function ShopSidebar({ categories, activeSlug }: { categories: Cat[]; activeSlug?: string }) {
  return (
    <aside className="card sticky top-24 h-fit">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">Shop by category</h3>
      <ul className="space-y-3 text-sm">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/shop/c/${c.slug}`} className={`block font-bold ${activeSlug === c.slug ? "text-amber" : "hover:text-amber"}`}>{c.name}</Link>
            <ul className="mt-1 space-y-1 border-l border-slate-200 pl-3 text-slate-600">
              {c.children.map((ch) => (
                <li key={ch.id}>
                  <Link href={`/shop/c/${ch.slug}`} className={`block hover:text-slate-900 ${activeSlug === ch.slug ? "text-amber" : ""}`}>{ch.name}</Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
