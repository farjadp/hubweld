import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const boards = await prisma.projectBoard.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { type, ...data } = body;

  if (type === "board") {
    const board = await prisma.projectBoard.create({ data });
    return NextResponse.json(board);
  }

  if (type === "task") {
    const task = await prisma.projectTask.create({ data });
    return NextResponse.json(task);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { type, id, ...data } = body;

  if (type === "task") {
    const task = await prisma.projectTask.update({ where: { id }, data });
    return NextResponse.json(task);
  }

  if (type === "board") {
    const board = await prisma.projectBoard.update({ where: { id }, data });
    return NextResponse.json(board);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (type === "task") {
    await prisma.projectTask.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (type === "board") {
    await prisma.projectBoard.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
