import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "ADMIN";
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const post = await (prisma as any).post.findUnique({
    where: { id: params.id },
    include: { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await guard()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { tagSlugs, status, ...data } = await req.json();

  if (status === "PUBLISHED") {
    const existing = await (prisma as any).post.findUnique({ where: { id: params.id }, select: { publishedAt: true } });
    if (!existing?.publishedAt) data.publishedAt = new Date();
  }
  data.status = status;

  const post = await (prisma as any).post.update({
    where: { id: params.id },
    data: {
      ...data,
      ...(tagSlugs !== undefined && {
        tags: {
          deleteMany: {},
          create: await resolveTagSlugs(tagSlugs),
        },
      }),
    },
    include: { category: true, tags: { include: { tag: true } } },
  });
  return NextResponse.json(post);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!await guard()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await (prisma as any).post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
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
