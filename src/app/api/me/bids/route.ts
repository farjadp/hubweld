import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toBid } from "@/lib/api-dto";
import type { MyBid } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** Bids the signed-in welder has placed, with the job each one is for. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "WELDER") return NextResponse.json([]);

  const bids = await prisma.bid.findMany({
    where: { welderId: me.id },
    include: { job: true, welder: { select: { name: true, welderProfile: { select: { approved: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const body: MyBid[] = bids.map((b) => ({
    ...toBid(b),
    job: { id: b.job.id, title: b.job.title, city: b.job.city, status: b.job.status as MyBid["job"]["status"] },
  }));
  return NextResponse.json(body);
}
