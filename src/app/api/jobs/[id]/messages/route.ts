import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — fetch messages for this job (only participants: owner or assigned welder)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { bids: { where: { status: "ACCEPTED" } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const acceptedBid = job.bids[0];
  const isParticipant =
    job.customerId === me.id ||
    (acceptedBid && acceptedBid.welderId === me.id) ||
    me.role === "ADMIN";

  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { jobId: params.id },
    include: { from: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

const schema = z.object({ body: z.string().min(1).max(4000) });

// POST — send a message
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { bids: { where: { status: "ACCEPTED" } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status === "CANCELLED") return NextResponse.json({ error: "Cannot message on a cancelled job" }, { status: 400 });

  const acceptedBid = job.bids[0];
  const isOwner = job.customerId === me.id;
  const isAssignedWelder = acceptedBid?.welderId === me.id;

  // Before job is assigned: allow any welder who bid (to discuss) + owner
  const hasBid = await prisma.bid.findFirst({ where: { jobId: params.id, welderId: me.id } });
  const isParticipant = isOwner || isAssignedWelder || (me.role === "WELDER" && !!hasBid);

  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // toId: if sender is owner → assigned welder (or first bidder), if sender is welder → owner
  const toId = isOwner ? (acceptedBid?.welderId ?? hasBid?.welderId ?? null) : job.customerId;
  if (!toId) return NextResponse.json({ error: "No recipient found" }, { status: 400 });

  const message = await prisma.message.create({
    data: { jobId: params.id, fromId: me.id, toId, body: parsed.data.body },
    include: { from: { select: { id: true, name: true } } },
  });
  return NextResponse.json(message);
}
