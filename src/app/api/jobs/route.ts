import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { contains } from "@/lib/search";
import { pageParam } from "@/lib/api-dto";
import type { JobSummary, Paged } from "@/lib/api-types";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  city: z.string().min(2),
  category: z.enum(["mobile", "fabrication", "repair", "structural", "other"]),
  budget: z.number().int().positive().nullable().optional(),
});

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

/**
 * Open jobs, newest first. `?q=` searches title and description, `?city=` and
 * `?category=` narrow it. This used to return 50 raw rows (customer ids
 * included) and nothing on the site called it; the app is its only client.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const city = url.searchParams.get("city")?.trim() ?? "";
  const category = url.searchParams.get("category")?.trim() ?? "";

  const where = {
    status: "OPEN",
    ...(category ? { category } : {}),
    ...(city ? { city: contains(city) } : {}),
    ...(q ? { OR: [{ title: contains(q) }, { description: contains(q) }] } : {}),
  };
  const total = await prisma.job.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = pageParam(url, pageCount);
  const jobs = await prisma.job.findMany({
    where,
    include: { _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const body: Paged<JobSummary> = {
    items: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      city: j.city,
      category: j.category as JobSummary["category"],
      budget: j.budget,
      status: j.status as JobSummary["status"],
      bidCount: j._count.bids,
      createdAt: j.createdAt.toISOString(),
    })),
    page,
    pageCount,
    total,
  };
  return NextResponse.json(body);
}

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role !== "CUSTOMER" && me.role !== "ADMIN") return NextResponse.json({ error: "Only customers can post jobs" }, { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const job = await prisma.job.create({ data: { ...parsed.data, budget: parsed.data.budget ?? null, customerId: me.id } });
  return NextResponse.json({ id: job.id });
}
