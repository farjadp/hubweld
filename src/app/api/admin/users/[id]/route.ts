import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function adminGuard() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") return null;
  return me;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await adminGuard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { action } = body;
  switch (action) {
    case "ban": await prisma.user.update({ where: { id: params.id }, data: { banned: true } }); break;
    case "unban": await prisma.user.update({ where: { id: params.id }, data: { banned: false } }); break;
    case "approveWelder": await prisma.welderProfile.update({ where: { userId: params.id }, data: { approved: true } }); break;
    case "unapproveWelder": await prisma.welderProfile.update({ where: { userId: params.id }, data: { approved: false } }); break;
    case "changeRole": {
      const role = body.role as string;
      if (!["CUSTOMER", "WELDER", "SUPPLIER", "ADMIN"].includes(role))
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      await prisma.user.update({ where: { id: params.id }, data: { role } });
      if (role === "WELDER") {
        await prisma.welderProfile.upsert({ where: { userId: params.id }, create: { userId: params.id }, update: {} });
      }
      if (role === "SUPPLIER") {
        await prisma.supplierProfile.upsert({ where: { userId: params.id }, create: { userId: params.id }, update: {} });
      }
      break;
    }
    default: return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await adminGuard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.name || body.email || body.city !== undefined) {
    await prisma.user.update({ where: { id: params.id }, data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.email ? { email: body.email } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
    }});
  }
  if (user.role === "WELDER" && body.profile) {
    await prisma.welderProfile.upsert({
      where: { userId: params.id },
      create: { userId: params.id, ...body.profile },
      update: body.profile,
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await adminGuard();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.id === me.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
