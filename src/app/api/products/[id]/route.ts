import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toProductSummary } from "@/lib/api-dto";
import type { ProductDetail } from "@/lib/api-types";

const patchSchema = z.object({
  name: z.string().min(3).optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  categoryId: z.string().optional(),
  priceCents: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
});

async function ownerCheck(id: string, me: any) {
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return { error: "Not found", status: 404 as const };
  if (p.supplierId !== me.id && me.role !== "ADMIN") return { error: "Forbidden", status: 403 as const };
  return { product: p };
}

export const dynamic = "force-dynamic";

/**
 * One product, by id or by slug. Drafts and archived items are visible only to
 * their supplier and to admins — the same rule as the /shop/p page, which 404s
 * anything not ACTIVE.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const p = await prisma.product.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { supplier: { include: { supplierProfile: true } }, category: true },
  });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (p.status !== "ACTIVE") {
    const me = await getCurrentUser();
    if (!me || (me.id !== p.supplierId && me.role !== "ADMIN")) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const related = await prisma.product.findMany({
    where: { categoryId: p.categoryId, status: "ACTIVE", NOT: { id: p.id } },
    take: 4,
  });

  const body: ProductDetail = {
    ...toProductSummary(p),
    sku: p.sku,
    description: p.description,
    status: p.status as ProductDetail["status"],
    category: { id: p.category.id, slug: p.category.slug, name: p.category.name },
    supplier: {
      id: p.supplierId,
      name: p.supplier.supplierProfile?.businessName || p.supplier.name,
      city: p.supplier.city,
      approved: !!p.supplier.supplierProfile?.approved,
      description: p.supplier.supplierProfile?.description ?? "",
    },
    related: related.map(toProductSummary),
  };
  return NextResponse.json(body);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const check = await ownerCheck(params.id, me);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (parsed.data.slug && parsed.data.slug !== check.product.slug) {
    const dup = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
    if (dup) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }
  await prisma.product.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const check = await ownerCheck(params.id, me);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
