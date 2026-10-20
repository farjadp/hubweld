import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { JobSummary } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** Jobs the signed-in customer has posted, newest first. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { customerId: me.id },
    include: { _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });
  const body: JobSummary[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    city: j.city,
    category: j.category as JobSummary["category"],
    budget: j.budget,
    status: j.status as JobSummary["status"],
    bidCount: j._count.bids,
    createdAt: j.createdAt.toISOString(),
  }));
  return NextResponse.json(body);
}
