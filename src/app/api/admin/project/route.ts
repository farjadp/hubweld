import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

/**
 * Project board CRUD.
 *
 * Previously `const { type, ...data } = await req.json()` went straight into
 * Prisma: any key in the body became a column write, and a malformed date or
 * an unknown field returned a 500 instead of a message. The schemas below are
 * the writable surface.
 */

// An omitted date must stay omitted: the board PATCHes a single field when a
// card moves, and collapsing `undefined` to null there would clear the task's
// dates on every drag.
const dateish = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === null ? null : new Date(v)))
  .refine((d) => d === undefined || d === null || !Number.isNaN(d.getTime()), { message: "Invalid date" });

const boardFields = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a hex value like #ef4444").default("#ef4444"),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

const taskFields = z.object({
  boardId: z.string().min(1),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).default(""),
  assignee: z.string().max(120).default(""),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  startDate: dateish,
  dueDate: dateish,
  completedAt: dateish,
  tags: z.string().max(500).default(""),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

const createInput = z.discriminatedUnion("type", [
  boardFields.extend({ type: z.literal("board") }),
  taskFields.extend({ type: z.literal("task") }),
]);

const updateInput = z.discriminatedUnion("type", [
  boardFields.partial().extend({ type: z.literal("board"), id: z.string().min(1) }),
  taskFields.partial().extend({ type: z.literal("task"), id: z.string().min(1) }),
]);

function badRequest(e: z.ZodError) {
  return NextResponse.json({ error: e.errors[0]?.message ?? "Invalid input" }, { status: 400 });
}

export async function GET() {
  if (!(await requireAdmin())) return forbidden();

  const boards = await prisma.projectBoard.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden();

  const parsed = createInput.safeParse(await req.json());
  if (!parsed.success) return badRequest(parsed.error);

  if (parsed.data.type === "board") {
    const { type, ...data } = parsed.data;
    const board = await prisma.projectBoard.create({ data });
    return NextResponse.json(board);
  }

  const { type, boardId, ...data } = parsed.data;
  const board = await prisma.projectBoard.findUnique({ where: { id: boardId }, select: { id: true } });
  if (!board) return NextResponse.json({ error: "Unknown board" }, { status: 400 });
  const task = await prisma.projectTask.create({ data: { ...data, boardId } });
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden();

  const parsed = updateInput.safeParse(await req.json());
  if (!parsed.success) return badRequest(parsed.error);
  const { type, id, ...data } = parsed.data;

  if (type === "task") {
    const existing = await prisma.projectTask.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const task = await prisma.projectTask.update({ where: { id }, data });
    return NextResponse.json(task);
  }

  const existing = await prisma.projectBoard.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const board = await prisma.projectBoard.update({ where: { id }, data });
  return NextResponse.json(board);
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (type === "task") {
    const existing = await prisma.projectTask.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.projectTask.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (type === "board") {
    const existing = await prisma.projectBoard.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Tasks cascade with the board.
    await prisma.projectBoard.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
