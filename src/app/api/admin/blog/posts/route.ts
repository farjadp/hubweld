import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const s = await getServerSession(authOptions);
  const me = s?.user as any;
  if (!me || me.role !== "ADMIN") return null;
  return me;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const take = 20;
  const [posts, total] = await Promise.all([
    (prisma as any).post.findMany({
      include: { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    (prisma as any).post.count(),
  ]);
  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / take) });
}

export async function POST(req: NextRequest) {
  const me = await guard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, slug, excerpt, body, coverImage, categoryId, tagSlugs, status, seoTitle, seoDesc, seoKeywords } = await req.json();

  const publishedAt = status === "PUBLISHED" ? new Date() : null;

  const post = await (prisma as any).post.create({
    data: {
      title, slug, excerpt, body,
      coverImage: coverImage ?? "",
      categoryId,
      authorId: me.id,
      status: status ?? "DRAFT",
      seoTitle: seoTitle ?? title,
      seoDesc: seoDesc ?? excerpt,
      seoKeywords: seoKeywords ?? "",
      publishedAt,
      tags: {
        create: await resolveTagSlugs(tagSlugs ?? []),
      },
    },
    include: { category: true, tags: { include: { tag: true } } },
  });
  return NextResponse.json(post);
}

async function resolveTagSlugs(slugs: string[]) {
  const result = [];
  for (const slug of slugs) {
    const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const tag = await (prisma as any).postTag.upsert({
      where: { slug },
      update: {},
      create: { slug, name },
    });
    result.push({ tagId: tag.id });
  }
  return result;
}
