import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  bio: z.string().max(4000).default(""),
  skills: z.string().max(500).default(""),
  certifications: z.string().max(500).default(""),
  serviceArea: z.string().max(200).default(""),
  hourlyRate: z.number().int().min(0).nullable().optional(),
  yearsExp: z.number().int().min(0).nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "WELDER") return NextResponse.json({ error: "Welders only" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await prisma.welderProfile.upsert({
    where: { userId: me.id },
    update: { ...parsed.data, hourlyRate: parsed.data.hourlyRate ?? null, yearsExp: parsed.data.yearsExp ?? null },
    create: { userId: me.id, ...parsed.data, hourlyRate: parsed.data.hourlyRate ?? null, yearsExp: parsed.data.yearsExp ?? null },
  });
  return NextResponse.json({ ok: true });
}
