import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { parseGallery, toBid, toReview } from "@/lib/api-dto";
import type { JobDetail } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/**
 * One job with its bids and reviews, plus what the viewer may do with it.
 * Visibility and the `viewer` flags follow the /jobs/[id] page exactly, so the
 * app never offers an action the API would then refuse.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, name: true } },
      bids: {
        include: { welder: { select: { name: true, welderProfile: { select: { approved: true } } } } },
        orderBy: { createdAt: "desc" },
      },
      reviews: { include: { author: { select: { name: true } } } },
    },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const bids = job.bids.map(toBid);
  const isOwner = !!me && me.id === job.customerId;
  const isWelder = me?.role === "WELDER";
  const accepted = bids.find((b) => b.status === "ACCEPTED");
  const myBid = isWelder ? bids.find((b) => b.welderId === me!.id) ?? null : null;
  const alreadyReviewed = isOwner && job.reviews.some((r) => r.authorId === me!.id);

  const body: JobDetail = {
    id: job.id,
    title: job.title,
    description: job.description,
    photos: parseGallery(job.photosJson),
    city: job.city,
    category: job.category as JobDetail["category"],
    budget: job.budget,
    status: job.status as JobDetail["status"],
    bidCount: bids.length,
    createdAt: job.createdAt.toISOString(),
    customer: job.customer,
    bids,
    reviews: job.reviews.map(toReview),
    viewer: {
      isOwner,
      isAssignedWelder: isWelder && accepted?.welderId === me!.id,
      myBid,
      canBid: isWelder && job.status === "OPEN" && !myBid,
      canMessage: !!me && job.status !== "CANCELLED" && (isOwner || (isWelder && !!myBid)),
      canReview: isOwner && job.status === "COMPLETED" && !!accepted && !alreadyReviewed,
    },
  };
  return NextResponse.json(body);
}
