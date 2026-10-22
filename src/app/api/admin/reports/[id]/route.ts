import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

/**
 * POST { action } — close a report.
 *   remove   take the content down (and resolve every open report on it)
 *   resolve  dealt with elsewhere, e.g. the account was banned from Users
 *   dismiss  nothing wrong
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await requireAdmin();
  if (!me) return forbidden();
  const { action } = await req.json().catch(() => ({}));
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  if (action === "dismiss" || action === "resolve") {
    await prisma.report.update({ where: { id: report.id }, data: { status: action === "dismiss" ? "DISMISSED" : "RESOLVED" } });
    return NextResponse.json({ ok: true });
  }
  if (action !== "remove") return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const id = report.targetId;
  switch (report.targetType) {
    // Jobs and products have history (bids, orders) hanging off them: hide, don't delete.
    case "JOB": await prisma.job.updateMany({ where: { id }, data: { status: "CANCELLED" } }); break;
    case "PRODUCT": await prisma.product.updateMany({ where: { id }, data: { status: "ARCHIVED" } }); break;
    case "BID": await prisma.bid.deleteMany({ where: { id } }); break;
    case "REVIEW": await prisma.review.deleteMany({ where: { id } }); break;
    case "MESSAGE": await prisma.message.deleteMany({ where: { id } }); break;
    case "USER": await prisma.user.updateMany({ where: { id, role: { not: "ADMIN" } }, data: { banned: true } }); break;
    default: return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }
  await prisma.report.updateMany({
    where: { targetType: report.targetType, targetId: id, status: "OPEN" },
    data: { status: "RESOLVED" },
  });
  return NextResponse.json({ ok: true });
}
