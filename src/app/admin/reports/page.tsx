import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReportRow, { type ReportRowData } from "./ReportRow";

export const dynamic = "force-dynamic";

/** Where to look at the reported thing on the site, when it has a page. */
async function linkFor(type: string, id: string): Promise<string | null> {
  switch (type) {
    case "JOB": return `/jobs/${id}`;
    case "BID": return (await prisma.bid.findUnique({ where: { id }, select: { jobId: true } }).then((b) => b && `/jobs/${b.jobId}`)) ?? null;
    case "MESSAGE": return (await prisma.message.findUnique({ where: { id }, select: { jobId: true } }).then((m) => m && `/jobs/${m.jobId}`)) ?? null;
    case "REVIEW": return (await prisma.review.findUnique({ where: { id }, select: { subjectId: true } }).then((r) => r && `/welders/${r.subjectId}`)) ?? null;
    case "PRODUCT": return (await prisma.product.findUnique({ where: { id }, select: { slug: true } }).then((p) => p && `/shop/p/${p.slug}`)) ?? null;
    case "USER": return `/welders/${id}`;
    default: return null;
  }
}

/**
 * User reports from the app and the site. The store guidelines expect each
 * one to be looked at within 24 hours; new reports are also emailed to OPS_EMAIL.
 */
export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const reports = await prisma.report.findMany({
    include: { reporter: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  // Open reports first, newest first within each group.
  reports.sort((a, b) => Number(b.status === "OPEN") - Number(a.status === "OPEN"));
  const ownerIds = [...new Set(reports.map((r) => r.targetUserId).filter((x): x is string => !!x))];
  const owners = new Map(
    (await prisma.user.findMany({ where: { id: { in: ownerIds } }, select: { id: true, name: true, email: true, banned: true } })).map((u) => [u.id, u])
  );
  const rows: ReportRowData[] = await Promise.all(
    reports.map(async (r) => ({
      id: r.id,
      targetType: r.targetType,
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      reporter: `${r.reporter.name} (${r.reporter.email})`,
      owner: (r.targetUserId && owners.get(r.targetUserId)) || null,
      link: await linkFor(r.targetType, r.targetId),
    }))
  );
  const openCount = rows.filter((r) => r.status === "OPEN").length;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">{openCount} open · review each within 24 hours</p>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => <ReportRow key={r.id} report={r} />)}
        {rows.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">No reports yet.</div>}
      </div>
    </div>
  );
}
