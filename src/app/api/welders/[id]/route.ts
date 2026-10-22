import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toReview, toWelderProfile, toWelderSummary } from "@/lib/api-dto";
import { getCurrentUser } from "@/lib/current-user";
import { hiddenUserIds } from "@/lib/blocks";
import type { WelderDetail } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** A welder's public profile with their latest reviews (as on /welders/[id]). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const welder = await prisma.user.findFirst({
    where: { id: params.id, role: "WELDER", banned: false },
    include: {
      welderProfile: true,
      receivedReviews: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!welder) return NextResponse.json({ error: "Welder not found" }, { status: 404 });
  const hidden = new Set(await hiddenUserIds((await getCurrentUser())?.id));
  if (hidden.has(welder.id)) return NextResponse.json({ error: "Welder not found" }, { status: 404 });
  const reviews = welder.receivedReviews.filter((r) => !hidden.has(r.authorId));

  const body: WelderDetail = {
    // Rating and count over all reviews; the list itself is the latest ten.
    ...toWelderSummary({ ...welder, receivedReviews: reviews }),
    profile: welder.welderProfile ? toWelderProfile(welder.welderProfile) : null,
    reviews: reviews.slice(0, 10).map(toReview),
  };
  return NextResponse.json(body);
}
