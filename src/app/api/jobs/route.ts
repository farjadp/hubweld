import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  city: z.string().min(2),
  category: z.enum(["mobile", "fabrication", "repair", "structural", "other"]),
  budget: z.number().int().positive().nullable().optional(),
});

export async function GET() {
  const jobs = await prisma.job.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "CUSTOMER" && me.role !== "ADMIN") return NextResponse.json({ error: "Only customers can post jobs" }, { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const job = await prisma.job.create({ data: { ...parsed.data, budget: parsed.data.budget ?? null, customerId: me.id } });
  return NextResponse.json({ id: job.id });
}
