import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { categoryInput } from "@/lib/blog";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = categoryInput.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const existing = await prisma.postCategory.findUnique({ where: { id: params.id }, select: { slug: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (d.slug && d.slug !== existing.slug) {
    const dup = await prisma.postCategory.findUnique({ where: { slug: d.slug }, select: { id: true } });
    if (dup) return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
  }
  // A category cannot be its own parent.
  if (d.parentId === params.id) {
    return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
  }

  const cat = await prisma.postCategory.update({ where: { id: params.id }, data: d });
  return NextResponse.json(cat);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden();
  const cat = await prisma.postCategory.findUnique({
    where: { id: params.id },
    select: { _count: { select: { posts: true, children: true } } },
  });
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Deleting a category with posts used to fail on the foreign key with a 500.
  if (cat._count.posts > 0) {
    return NextResponse.json(
      { error: `${cat._count.posts} post(s) still use this category. Move them first.` },
      { status: 409 }
    );
  }
  if (cat._count.children > 0) {
    return NextResponse.json({ error: "Delete or move the subcategories first." }, { status: 409 });
  }
  await prisma.postCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
