import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Tag, Calendar, ArrowRight, FolderOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | HubWeld – Welding Industry Insights & News",
  description: "Expert articles on welding parts distribution, industrial sourcing, MIG/TIG welding, surplus stock management, and the global welding supply chain.",
  keywords: ["welding blog", "welding industry news", "industrial welding tips", "HubWeld blog", "welding parts sourcing", "welding distribution insights"],
  alternates: { canonical: "/blog" },
  openGraph: { title: "HubWeld Blog – Welding Industry Insights", description: "Expert articles on welding parts, distribution, and industrial sourcing.", url: "https://www.hubweld.com/blog", siteName: "HubWeld", type: "website" },
};

const TAKE = 12;

export default async function BlogPage({ searchParams }: { searchParams: { page?: string; cat?: string; tag?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const skip = (page - 1) * TAKE;

  const where: any = { status: "PUBLISHED" };
  if (searchParams.cat) where.category = { slug: searchParams.cat };
  if (searchParams.tag) where.tags = { some: { tag: { slug: searchParams.tag } } };

  const [posts, total, cats, featuredPosts] = await Promise.all([
    (prisma as any).post.findMany({
      where,
      include: { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: TAKE,
    }),
    (prisma as any).post.count({ where }),
    (prisma as any).postCategory.findMany({
      where: { posts: { some: { status: "PUBLISHED" } } },
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    }),
    page === 1 && !searchParams.cat && !searchParams.tag
      ? (prisma as any).post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 1, include: { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } } })
      : Promise.resolve([]),
  ]);

  const pages = Math.ceil(total / TAKE);
  const featured = featuredPosts[0];
  const rest = featured ? posts.filter((p: any) => p.id !== featured.id) : posts;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HubWeld", item: "https://www.hubweld.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.hubweld.com/blog" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HERO SECTION ── */}
      <section className="relative -mx-4 mb-12 overflow-hidden" style={{ margin: "0 calc(-1 * (100vw - min(1180px, calc(100% - 0px))) / 2)" }}>
        <div className="relative h-[50vh] min-h-[400px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1800&q=85"
            alt="Professional welder working with bright arc flash in industrial workshop"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/75 to-ink-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-[1180px] px-8">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-600/10 px-4 py-1.5">
                  <FolderOpen size={14} className="text-brand" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-brand">HubWeld Blog</span>
                </div>
                <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
                  Welding industry<br />
                  <span className="text-brand">insights & news.</span>
                </h1>
                <p className="mt-5 max-w-lg text-lg text-slate-700 leading-relaxed">
                  Expert articles on parts sourcing, MIG/TIG welding techniques, surplus stock management, and the global industrial welding supply chain.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                    <Tag size={12} className="text-brand" /> {total} articles
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                    <Calendar size={12} className="text-brand" /> Updated weekly
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pb-20">
        {/* Category chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${!searchParams.cat ? "border-red-600/40 bg-red-600/15 text-brand" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-white"}`}
          >
            All Posts ({total})
          </Link>
          {cats.map((c: any) => (
            <Link
              key={c.id}
              href={`/blog?cat=${c.slug}`}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${searchParams.cat === c.slug ? "border-red-600/40 bg-red-600/15 text-brand" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-white"}`}
            >
              {c.name} ({c._count.posts})
            </Link>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {/* Featured - Large Card */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group relative mb-10 block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-red-600/30 hover:shadow-xl hover:shadow-red-600/5">
                <div className="grid md:grid-cols-[1.2fr_1fr]">
                  {featured.coverImage && (
                    <div className="relative h-64 w-full overflow-hidden md:h-auto">
                      <img src={featured.coverImage} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111315]/80 md:to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-transparent md:hidden" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center p-6 md:p-8">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-600/30 bg-red-600/10 px-3 py-1 font-semibold text-brand">
                        <FolderOpen size={11} /> {featured.category.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Calendar size={11} /> {new Date(featured.publishedAt).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 transition-colors group-hover:text-brand md:text-3xl">{featured.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">{featured.excerpt}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-bold text-brand">
                      Read featured article <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Section Title */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-red-600/40 to-transparent" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Latest Articles</span>
              <div className="h-px flex-1 bg-gradient-to-l from-red-600/40 to-transparent" />
            </div>

            {/* Grid - Improved Cards */}
            {rest.length === 0 && !featured ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">No posts published yet.</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {rest.map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-red-600/30 hover:shadow-lg hover:shadow-red-600/5">
                    {post.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/20 to-transparent" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-brand">{post.category.name}</span>
                        <span className="text-slate-300">|</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 transition-colors group-hover:text-brand line-clamp-2">{post.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2">{post.excerpt}</p>
                      {post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 3).map((t: any) => (
                            <span key={t.tag.slug} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-500">{t.tag.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blog?page=${p}${searchParams.cat ? `&cat=${searchParams.cat}` : ""}${searchParams.tag ? `&tag=${searchParams.tag}` : ""}`}
                    className={`grid h-9 w-9 place-items-center rounded-lg border text-sm font-semibold transition-colors ${p === page ? "border-red-600/40 bg-red-600/15 text-brand" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-white"}`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="self-start">
            <div className="sticky top-20 grid gap-5">
              {/* Newsletter Box */}
              <div className="relative overflow-hidden rounded-xl border border-red-600/20 bg-gradient-to-br from-red-600/10 to-[#111315] p-6">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-600/10 blur-2xl" />
                <h3 className="relative mb-2 text-sm font-black text-slate-900">Stay Updated</h3>
                <p className="relative mb-4 text-xs leading-relaxed text-slate-500">Get welding industry insights delivered to your inbox weekly.</p>
                <div className="relative flex gap-2">
                  <input type="email" placeholder="Enter email" className="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-500/50 focus:outline-none" />
                  <button className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors">Join</button>
                </div>
              </div>

              {/* Categories */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  <FolderOpen size={12} /> Categories
                </h3>
                <ul className="grid gap-1">
                  <li>
                    <Link href="/blog" className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${!searchParams.cat ? "bg-red-600/10 text-brand font-semibold" : "text-slate-500 hover:bg-slate-100 hover:text-white"}`}>
                      <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${!searchParams.cat ? "bg-red-400" : "bg-slate-200"}`} />
                        All Posts
                      </span>
                      <span className="text-xs text-slate-400">{total + (featured ? 1 : 0)}</span>
                    </Link>
                  </li>
                  {cats.map((c: any) => (
                    <li key={c.id}>
                      <Link href={`/blog?cat=${c.slug}`} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${searchParams.cat === c.slug ? "bg-red-600/10 text-brand font-semibold" : "text-slate-500 hover:bg-slate-100 hover:text-white"}`}>
                        <span className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${searchParams.cat === c.slug ? "bg-red-400" : "bg-slate-200"}`} />
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-400">{c._count.posts}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Banner */}
              <div className="relative h-40 overflow-hidden rounded-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80"
                  alt="Industrial welding workshop"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-bold text-slate-800">Join our certified welding network</p>
                  <Link href="/register" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-light">
                    Register now <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
