import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { tagInput } from "@/lib/blog";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const tags = await prisma.postTag.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = tagInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, slug } = parsed.data;
  const tag = await prisma.postTag.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  return NextResponse.json(tag);
}
