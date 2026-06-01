import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { bidId } = await req.json();
  const job = await prisma.job.findUnique({ where: { id: params.id }, include: { bids: true } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.customerId !== me.id && me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "OPEN") return NextResponse.json({ error: "Job not open" }, { status: 400 });
  const bid = job.bids.find((b) => b.id === bidId);
  if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.bid.update({ where: { id: bidId }, data: { status: "ACCEPTED" } }),
    prisma.bid.updateMany({ where: { jobId: job.id, NOT: { id: bidId } }, data: { status: "REJECTED" } }),
    prisma.job.update({ where: { id: job.id }, data: { status: "ASSIGNED", acceptedBidId: bidId } }),
  ]);
  return NextResponse.json({ ok: true });
}
