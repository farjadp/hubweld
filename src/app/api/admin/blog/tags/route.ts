import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "ADMIN";
}

export async function GET() {
  const tags = await (prisma as any).postTag.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  if (!await guard()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, slug } = await req.json();
  const tag = await (prisma as any).postTag.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
  return NextResponse.json(tag);
}
