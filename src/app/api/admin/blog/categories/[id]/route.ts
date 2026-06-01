import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const s = await getServerSession(authOptions);
  const me = s?.user as any;
  return me?.role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await guard()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await req.json();
  const cat = await (prisma as any).postCategory.update({ where: { id: params.id }, data });
  return NextResponse.json(cat);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!await guard()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await (prisma as any).postCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
