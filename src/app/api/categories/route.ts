import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CategoryDto } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** Top-level product categories with their subcategories, in display order. */
export async function GET() {
  const cats = await prisma.productCategory.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  const body: CategoryDto[] = cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    children: c.children.map((k) => ({ id: k.id, slug: k.slug, name: k.name })),
  }));
  return NextResponse.json(body);
}
