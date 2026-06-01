import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { action } = await req.json();
  switch (action) {
    case "ban": await prisma.user.update({ where: { id: params.id }, data: { banned: true } }); break;
    case "unban": await prisma.user.update({ where: { id: params.id }, data: { banned: false } }); break;
    case "approveWelder": await prisma.welderProfile.update({ where: { userId: params.id }, data: { approved: true } }); break;
    case "unapproveWelder": await prisma.welderProfile.update({ where: { userId: params.id }, data: { approved: false } }); break;
    default: return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
