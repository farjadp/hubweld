import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
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
