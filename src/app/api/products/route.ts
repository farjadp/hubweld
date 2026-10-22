import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { contains } from "@/lib/search";
import { hiddenUserIds } from "@/lib/blocks";
import { pageParam, toProductSummary } from "@/lib/api-dto";
import type { Paged, ProductSummary } from "@/lib/api-types";

const schema = z.object({
  name: z.string().min(3),
  brand: z.string().default(""),
  sku: z.string().default(""),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  categoryId: z.string().min(1),
  priceCents: z.number().int().min(0),
  stock: z.number().int().min(0),
  imageUrl: z.string().default(""),
  description: z.string().default(""),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
});

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

/**
 * Active catalogue, same filter and ordering as /shop.
 * `?q=` searches name, brand and description; `?category=<slug>` includes the
 * category's subcategories; `?featured=1` returns featured items only.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const categorySlug = url.searchParams.get("category")?.trim() ?? "";
  const featuredOnly = url.searchParams.get("featured") === "1";

  let categoryIds: string[] | null = null;
  if (categorySlug) {
    const cat = await prisma.productCategory.findUnique({ where: { slug: categorySlug }, include: { children: { select: { id: true } } } });
    if (!cat) return NextResponse.json({ items: [], page: 1, pageCount: 1, total: 0 } satisfies Paged<ProductSummary>);
    categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
  }

  const hidden = await hiddenUserIds((await getCurrentUser())?.id);
  const where = {
    status: "ACTIVE",
    ...(hidden.length ? { supplierId: { notIn: hidden } } : {}),
    ...(featuredOnly ? { featured: true } : {}),
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    ...(q ? { OR: [{ name: contains(q) }, { brand: contains(q) }, { description: contains(q) }] } : {}),
  };

  const total = await prisma.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = pageParam(url, pageCount);
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const body: Paged<ProductSummary> = { items: products.map(toProductSummary), page, pageCount, total };
  return NextResponse.json(body);
}

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") return NextResponse.json({ error: "Suppliers only" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const dup = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (dup) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  const cat = await prisma.productCategory.findUnique({ where: { id: parsed.data.categoryId } });
  if (!cat) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  const product = await prisma.product.create({ data: { ...parsed.data, supplierId: me.id } });
  return NextResponse.json({ id: product.id });
}
