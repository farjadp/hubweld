import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
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
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const check = await ownerCheck(params.id, me);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
