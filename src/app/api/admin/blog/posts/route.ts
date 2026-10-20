import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { postInput, resolveTagSlugs } from "@/lib/blog";

export async function GET(req: NextRequest) {
  // Unguarded, this listed every post including unpublished drafts.
  if (!(await requireAdmin())) return forbidden();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const take = 20;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      include: { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.post.count(),
  ]);
  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / take) });
}

export async function POST(req: NextRequest) {
  const me = await requireAdmin();
  if (!me) return forbidden();

  // These routes were the only ones in the app taking req.json() straight into
  // Prisma. A bad field 500'd, and a duplicate slug surfaced as a raw
  // constraint error instead of a message the editor could show.
  const parsed = postInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const [dup, category] = await Promise.all([
    prisma.post.findUnique({ where: { slug: d.slug }, select: { id: true } }),
    prisma.postCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } }),
  ]);
  if (dup) return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
  if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      body: d.body,
      coverImage: d.coverImage,
      categoryId: d.categoryId,
      authorId: me.id,
      status: d.status,
      seoTitle: d.seoTitle || d.title,
      seoDesc: d.seoDesc || d.excerpt,
      seoKeywords: d.seoKeywords,
      publishedAt: d.status === "PUBLISHED" ? new Date() : null,
      tags: { create: await resolveTagSlugs(d.tagSlugs) },
    },
    include: { category: true, tags: { include: { tag: true } } },
  });
  return NextResponse.json(post);
}
