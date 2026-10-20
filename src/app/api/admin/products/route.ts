import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

const schema = z.object({
  name: z.string().min(3),
  brand: z.string().default(""),
  sku: z.string().default(""),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  categoryId: z.string().min(1),
  supplierId: z.string().min(1),
  priceCents: z.number().int().min(0),
  stock: z.number().int().min(0),
  imageUrl: z.string().default(""),
  description: z.string().default(""),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return forbidden();

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const { supplierId, ...rest } = parsed.data;

  const supplierExists = await prisma.user.findUnique({ where: { id: supplierId } });
  if (!supplierExists) return NextResponse.json({ error: "Supplier not found" }, { status: 400 });

  const dup = await prisma.product.findUnique({ where: { slug: rest.slug } });
  if (dup) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

  const cat = await prisma.productCategory.findUnique({ where: { id: rest.categoryId } });
  if (!cat) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const product = await prisma.product.create({ data: { ...rest, supplierId } });
  return NextResponse.json({ id: product.id });
}
