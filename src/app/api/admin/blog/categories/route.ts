import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { categoryInput } from "@/lib/blog";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const cats = await prisma.postCategory.findMany({
    include: { children: true },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = categoryInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const dup = await prisma.postCategory.findUnique({ where: { slug: d.slug }, select: { id: true } });
  if (dup) return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
  if (d.parentId) {
    const parent = await prisma.postCategory.findUnique({ where: { id: d.parentId }, select: { id: true } });
    if (!parent) return NextResponse.json({ error: "Unknown parent category" }, { status: 400 });
  }

  const cat = await prisma.postCategory.create({
    data: {
      name: d.name,
      slug: d.slug,
      description: d.description,
      parentId: d.parentId || null,
      ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    },
  });
  return NextResponse.json(cat);
}
