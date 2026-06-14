import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).default(""),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { bids: { where: { status: "ACCEPTED" } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status !== "COMPLETED") return NextResponse.json({ error: "Job must be completed to leave a review" }, { status: 400 });

  const acceptedBid = job.bids[0];
  if (!acceptedBid) return NextResponse.json({ error: "No accepted bid found" }, { status: 400 });

  // Only the job owner can review the welder (for now)
  if (job.customerId !== me.id) return NextResponse.json({ error: "Only the job owner can leave a review" }, { status: 403 });

  const subjectId = acceptedBid.welderId;

  // Prevent duplicate review
  const existing = await prisma.review.findFirst({ where: { jobId: job.id, authorId: me.id } });
  if (existing) return NextResponse.json({ error: "You already reviewed this job" }, { status: 409 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const review = await prisma.review.create({
    data: { jobId: job.id, authorId: me.id, subjectId, rating: parsed.data.rating, comment: parsed.data.comment },
  });
  return NextResponse.json({ id: review.id });
}
