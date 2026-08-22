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
  const isOwner = job.customerId === me.id;
  const isAdmin = me.role === "ADMIN";
  // Anyone who bid may read their own thread — POST already lets them write,
  // and a welder who could send but not read had a one-way conversation.
  const myBid =
    me.role === "WELDER"
      ? await prisma.bid.findFirst({ where: { jobId: params.id, welderId: me.id }, select: { id: true } })
      : null;

  if (!isOwner && !isAdmin && !myBid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // A welder sees only their own correspondence, never other bidders'.
  const messages = await prisma.message.findMany({
    where: {
      jobId: params.id,
      ...(isOwner || isAdmin ? {} : { OR: [{ fromId: me.id }, { toId: me.id }] }),
    },
    include: { from: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

const schema = z.object({
  body: z.string().min(1).max(4000),
  // Optional: the customer naming which bidder they are writing to, before award.
  toId: z.string().optional(),
});

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

  // Work out the recipient.
  //
  // A welder always writes to the customer. The customer writes to the
  // assigned welder once a bid is accepted; before that they must say which
  // bidder they mean, because several welders can be in the running. The
  // single-bidder case is resolved automatically so the common path needs no
  // extra choice.
  let toId: string | null = null;
  if (isOwner) {
    if (acceptedBid) {
      toId = acceptedBid.welderId;
    } else {
      const bidders = await prisma.bid.findMany({
        where: { jobId: params.id },
        select: { welderId: true },
      });
      const requested = parsed.data.toId;
      if (requested) {
        if (!bidders.some((b) => b.welderId === requested)) {
          return NextResponse.json({ error: "That welder has not bid on this job" }, { status: 400 });
        }
        toId = requested;
      } else if (bidders.length === 1) {
        toId = bidders[0].welderId;
      } else if (bidders.length === 0) {
        return NextResponse.json(
          { error: "No one has bid on this job yet, so there is nobody to message." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Choose which welder to reply to." },
          { status: 400 }
        );
      }
    }
  } else {
    toId = job.customerId;
  }
  if (!toId) return NextResponse.json({ error: "No recipient found" }, { status: 400 });

  const message = await prisma.message.create({
    data: { jobId: params.id, fromId: me.id, toId, body: parsed.data.body },
    include: { from: { select: { id: true, name: true } } },
  });
  return NextResponse.json(message);
}
