import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, FolderOpen, Tag, ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { SITE_URL, url } from "@/lib/site";
import { extractFaq } from "@/lib/blog-faq";

export const dynamic = "force-dynamic";

/**
 * Read the post.
 *
 * `cache` dedupes this within a request: generateMetadata and the page body
 * both need the post, and because the read used to bump the view counter as a
 * side effect, every visit was being counted twice.
 */
const getPost = cache(async (slug: string) =>
  prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { include: { parent: true } },
      author: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  })
);

const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|monitor|curl|wget|python-requests|axios|node-fetch/i;

/**
 * Count a human read.
 *
 * The page is force-dynamic, so every crawler hit was a write — inflating the
 * number and, on SQLite, taking a write lock to do it. Crawlers and link
 * unfurlers are skipped, and a failed count must never break the article.
 */
async function recordView(id: string): Promise<void> {
  if (BOT_UA.test(headers().get("user-agent") ?? "")) return;
  try {
    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
  } catch {
    /* a view counter is not worth a 500 */
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  // The root layout's title template already appends "| HubWeld"; older posts
  // carry it in seoTitle too, which doubled the brand in the browser tab.
  const title = (post.seoTitle || post.title).replace(/\s*[|–-]\s*HubWeld\s*$/i, "");
  return {
    title,
    description: post.seoDesc || post.excerpt,
    keywords: post.seoKeywords ? post.seoKeywords.split(",").map((k: string) => k.trim()) : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description: post.seoDesc || post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "HubWeld",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.author.name],
      ...(post.coverImage ? { images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}

function readingTime(body: string) {
  const words = body.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  await recordView(post.id);

  const related = await prisma.post.findMany({
    where: { status: "PUBLISHED", categoryId: post.categoryId, slug: { not: post.slug } },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const mins = readingTime(post.body);

  // publishedAt is nullable in the schema, and `new Date(null)` renders as
  // "Invalid Date" — the `prisma as any` cast was hiding that. createdAt is
  // always set, so it is the honest fallback.
  const publishedLabel = (post.publishedAt ?? post.createdAt).toLocaleString("en", {
    year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  // Covers can be site-relative (/images/blog/...); structured data needs an absolute URL.
  const coverUrl = post.coverImage.startsWith("/") ? url(post.coverImage) : post.coverImage;

  const faq = extractFaq(post.body);
  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: "HubWeld", url: SITE_URL },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(post.coverImage ? { image: coverUrl } : {}),
    articleSection: post.category.name,
    keywords: post.seoKeywords || post.tags.map((t: any) => t.tag.name).join(", "),
    inLanguage: "en-US",
    about: { "@type": "Thing", name: "Industrial Welding" },
    mentions: [
      { "@type": "Organization", name: "HubWeld", url: SITE_URL },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HubWeld", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      ...(post.category.parent ? [{ "@type": "ListItem", position: 3, name: post.category.parent.name, item: `${SITE_URL}/blog?cat=${post.category.parent.slug}` }] : []),
      { "@type": "ListItem", position: post.category.parent ? 4 : 3, name: post.category.name, item: `${SITE_URL}/blog?cat=${post.category.slug}` },
      { "@type": "ListItem", position: post.category.parent ? 5 : 4, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <div className="mx-auto max-w-[720px] pb-24 pt-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <Link href="/blog" className="hover:text-slate-600 transition-colors">Blog</Link>
          <span>/</span>
          {post.category.parent && (
            <>
              <Link href={`/blog?cat=${post.category.parent.slug}`} className="hover:text-slate-600 transition-colors">{post.category.parent.name}</Link>
              <span>/</span>
            </>
          )}
          <Link href={`/blog?cat=${post.category.slug}`} className="hover:text-slate-600 transition-colors">{post.category.name}</Link>
          <span>/</span>
          <span className="text-slate-500 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            <Link href={`/blog?cat=${post.category.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-red-600/30 bg-red-600/10 px-3 py-1 text-brand hover:bg-red-600/20 transition-colors">
              <FolderOpen size={12} /> {post.category.name}
            </Link>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1"><Calendar size={12} /> {publishedLabel}</span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1"><Eye size={12} /> {post.views} Views</span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1"><Clock size={12} /> {mins} min read</span>
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">{post.title}</h1>

          {post.excerpt && (
            <p className="mt-6 text-lg leading-relaxed text-slate-600">{post.excerpt}</p>
          )}

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {post.tags.map((t: any) => (
                <Link key={t.tag.slug} href={`/blog?tag=${t.tag.slug}`} className="text-sm font-bold text-brand hover:text-brand-light transition-colors">
                  #{t.tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-t border-slate-200 pt-6 text-sm text-slate-400">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-sm font-black text-slate-900 shadow-lg">
              {post.author.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-700">{post.author.name}</span>
              <span className="text-xs">HubWeld Expert</span>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200">
            {/* Above the fold: this is the LCP image, so it loads eagerly. */}
            <img fetchPriority="high" decoding="async" src={post.coverImage} alt={post.title} className="w-full object-cover max-h-[480px]" />
          </div>
        )}

        {/* Body */}
        {/* Model-written HTML goes through an allowlist before it reaches a
            reader's page. See lib/sanitize.ts. */}
        <article
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(post.body) }}
        />

        {/* Related */}
        {related.length > 0 && (
          <aside className="mt-16 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-ink-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-red-600" />
              <h2 className="text-xl font-black tracking-tight text-slate-900">Keep Reading</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r: any) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:border-brand/40 hover:bg-slate-100 transition-all">
                  {r.coverImage && (
                    <div className="h-32 w-full overflow-hidden">
                      <img loading="lazy" decoding="async" src={r.coverImage} alt={r.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-2 text-xs font-bold text-brand">{r.category.name}</div>
                    <div className="text-sm font-semibold leading-snug text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-2">{r.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Back */}
        <div className="mt-10 pt-6 border-t border-slate-200">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
      </div>
    </>
  );
}
