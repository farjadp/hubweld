import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { isBlockedBetween } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";
import { notifyUsers } from "@/lib/push";
import { formatDollars } from "@/lib/money";

const schema = z.object({ amount: z.number().int().positive(), message: z.string().max(2000).optional().default("") });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "WELDER") return NextResponse.json({ error: "Only welders can bid" }, { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status !== "OPEN") return NextResponse.json({ error: "Job is not open" }, { status: 400 });
  if (await isBlockedBetween(me.id, job.customerId)) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  try {
    const bid = await prisma.bid.create({ data: { jobId: job.id, welderId: me.id, amount: parsed.data.amount, message: parsed.data.message ?? "" } });
    notifyUsers(job.customerId, {
      title: `New bid on ${job.title}`,
      body: `${me.name} bid ${formatDollars(parsed.data.amount)}`,
      data: { type: "job", jobId: job.id },
    });
    return NextResponse.json({ id: bid.id });
  } catch {
    return NextResponse.json({ error: "You already bid on this job" }, { status: 409 });
  }
}
