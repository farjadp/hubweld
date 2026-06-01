import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, FolderOpen, Tag, ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return (prisma as any).post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { include: { parent: true } },
      author: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt,
    keywords: post.seoKeywords ? post.seoKeywords.split(",").map((k: string) => k.trim()) : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDesc || post.excerpt,
      url: `https://www.hubweld.com/blog/${post.slug}`,
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

  const related = await (prisma as any).post.findMany({
    where: { status: "PUBLISHED", categoryId: post.categoryId, slug: { not: post.slug } },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const mins = readingTime(post.body);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: "HubWeld", url: "https://www.hubweld.com" },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    url: `https://www.hubweld.com/blog/${post.slug}`,
    ...(post.coverImage ? { image: post.coverImage } : {}),
    articleSection: post.category.name,
    keywords: post.seoKeywords || post.tags.map((t: any) => t.tag.name).join(", "),
    inLanguage: "en-US",
    about: { "@type": "Thing", name: "Industrial Welding" },
    mentions: [
      { "@type": "Organization", name: "HubWeld", url: "https://www.hubweld.com" },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HubWeld", item: "https://www.hubweld.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.hubweld.com/blog" },
      ...(post.category.parent ? [{ "@type": "ListItem", position: 3, name: post.category.parent.name, item: `https://www.hubweld.com/blog?cat=${post.category.parent.slug}` }] : []),
      { "@type": "ListItem", position: post.category.parent ? 4 : 3, name: post.category.name, item: `https://www.hubweld.com/blog?cat=${post.category.slug}` },
      { "@type": "ListItem", position: post.category.parent ? 5 : 4, name: post.title, item: `https://www.hubweld.com/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[720px] pb-24 pt-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-white/30">
          <Link href="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
          <span>/</span>
          {post.category.parent && (
            <>
              <Link href={`/blog?cat=${post.category.parent.slug}`} className="hover:text-white/60 transition-colors">{post.category.parent.name}</Link>
              <span>/</span>
            </>
          )}
          <Link href={`/blog?cat=${post.category.slug}`} className="hover:text-white/60 transition-colors">{post.category.name}</Link>
          <span>/</span>
          <span className="text-white/50 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/40">
            <Link href={`/blog?cat=${post.category.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-red-600/30 bg-red-600/10 px-3 py-1 text-red-400 hover:bg-red-600/20 transition-colors">
              <FolderOpen size={10} /> {post.category.name}
            </Link>
            <span className="inline-flex items-center gap-1"><Calendar size={10} /> {new Date(post.publishedAt).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="inline-flex items-center gap-1"><Clock size={10} /> {mins} min read</span>
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">{post.title}</h1>

          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-white/50">{post.excerpt}</p>
          )}

          <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-5 text-sm text-white/30">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-xs font-black text-white">
              {post.author.name.slice(0, 2).toUpperCase()}
            </div>
            <span>{post.author.name}</span>
          </div>
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-10 overflow-hidden rounded-2xl border border-white/10">
            <img src={post.coverImage} alt={post.title} className="w-full object-cover max-h-[480px]" />
          </div>
        )}

        {/* Body */}
        <article
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/5 pt-6">
            <Tag size={13} className="text-white/30" />
            {post.tags.map((t: any) => (
              <Link key={t.tag.slug} href={`/blog?tag=${t.tag.slug}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40 hover:border-red-600/30 hover:text-red-400 transition-colors">
                {t.tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <aside className="mt-14">
            <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-white/30">Related Articles</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map((r: any) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group rounded-xl border border-white/10 bg-[#111315] p-4 hover:border-red-600/30 transition-colors">
                  <div className="mb-1 text-xs text-white/30">{r.category.name}</div>
                  <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2">{r.title}</div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Back */}
        <div className="mt-10 pt-6 border-t border-white/5">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
      </div>
    </>
  );
}
