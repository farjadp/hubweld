import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const s = await getServerSession(authOptions);
  const me = s?.user as any;
  if (!me || me.role !== "ADMIN") return false;
  return true;
}

export async function GET() {
  const cats = await (prisma as any).postCategory.findMany({
    include: { children: true },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  if (!await guard()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, slug, description, parentId } = await req.json();
  const cat = await (prisma as any).postCategory.create({
    data: { name, slug, description: description ?? "", parentId: parentId || null },
  });
  return NextResponse.json(cat);
}
