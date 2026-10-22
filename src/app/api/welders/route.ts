import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contains } from "@/lib/search";
import { getCurrentUser } from "@/lib/current-user";
import { hiddenUserIds } from "@/lib/blocks";
import { pageParam, toWelderSummary } from "@/lib/api-dto";
import type { Paged, WelderSummary } from "@/lib/api-types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

/** The welder directory: same filters and ordering as /directory. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const city = url.searchParams.get("city")?.trim() ?? "";
  const verifiedOnly = url.searchParams.get("verified") === "1";
  const hidden = await hiddenUserIds((await getCurrentUser())?.id);

  const where = {
    role: "WELDER",
    banned: false,
    ...(hidden.length ? { id: { notIn: hidden } } : {}),
    ...(verifiedOnly ? { welderProfile: { approved: true } } : {}),
    AND: [
      q ? { OR: [{ name: contains(q) }, { welderProfile: { skills: contains(q) } }, { welderProfile: { certifications: contains(q) } }] } : {},
      city ? { OR: [{ city: contains(city) }, { welderProfile: { serviceArea: contains(city) } }] } : {},
    ],
  };
  const total = await prisma.user.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = pageParam(url, pageCount);
  const welders = await prisma.user.findMany({
    where,
    include: { welderProfile: true, receivedReviews: { select: { rating: true } } },
    orderBy: [{ welderProfile: { approved: "desc" } }, { createdAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  // Best-rated first within the page, under verified-first (as on the site).
  const items = welders.map(toWelderSummary).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const body: Paged<WelderSummary> = { items, page, pageCount, total };
  return NextResponse.json(body);
}
