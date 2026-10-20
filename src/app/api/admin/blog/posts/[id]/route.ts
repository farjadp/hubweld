import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { postPatchInput, resolveTagSlugs } from "@/lib/blog";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  // Unguarded, this served any post by id, drafts included.
  if (!(await requireAdmin())) return forbidden();
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden();

  // Only the fields in postPatchInput are writable. Spreading the request body
  // let a caller set views, authorId, createdAt — anything on the row.
  const parsed = postPatchInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { tagSlugs, ...d } = parsed.data;

  const existing = await prisma.post.findUnique({
    where: { id: params.id },
    select: { publishedAt: true, slug: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (d.slug && d.slug !== existing.slug) {
    const dup = await prisma.post.findUnique({ where: { slug: d.slug }, select: { id: true } });
    if (dup) return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
  }
  if (d.categoryId) {
    const category = await prisma.postCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } });
    if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  // First publish stamps publishedAt; re-publishing keeps the original date.
  const publishedAt = d.status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined;

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      ...d,
      ...(publishedAt ? { publishedAt } : {}),
      ...(tagSlugs !== undefined && {
        tags: { deleteMany: {}, create: await resolveTagSlugs(tagSlugs) },
      }),
    },
    include: { category: true, tags: { include: { tag: true } } },
  });
  return NextResponse.json(post);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden();
  const existing = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
