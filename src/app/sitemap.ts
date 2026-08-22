import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Generated rather than hand-maintained: the static sitemap listed ten static
 * routes and none of the published articles, products, or welder profiles,
 * so most of the site was invisible to crawlers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/solutions/distributors`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/solutions/brokers`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/solutions/integrators`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/jobs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/directory`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about/product`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about/team`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/register`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // A crawl must never fail because the database is briefly unreachable.
  try {
    const [posts, products, categories, welders] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.productCategory.findMany({ select: { slug: true } }),
      prisma.user.findMany({
        where: { role: "WELDER", banned: false, welderProfile: { approved: true } },
        select: { id: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt ?? p.publishedAt ?? undefined,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...products.map((p) => ({
        url: `${SITE_URL}/shop/p/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...categories.map((c) => ({
        url: `${SITE_URL}/shop/c/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...welders.map((w) => ({
        url: `${SITE_URL}/welders/${w.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
