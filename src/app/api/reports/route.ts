import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { opsAddress, sendMailSafe } from "@/lib/email";
import { button, escapeHtml, layout, notice } from "@/lib/email-templates";
import { SITE_URL } from "@/lib/site";

const TARGETS = ["JOB", "BID", "REVIEW", "MESSAGE", "USER", "PRODUCT"] as const;
const REASONS = {
  SPAM: "Spam or advertising",
  HARASSMENT: "Harassment or abuse",
  INAPPROPRIATE: "Inappropriate or offensive",
  SCAM: "Scam or fraud",
  OTHER: "Something else",
} as const;

const schema = z.object({
  targetType: z.enum(TARGETS),
  targetId: z.string().min(1).max(100),
  reason: z.enum(Object.keys(REASONS) as [keyof typeof REASONS, ...(keyof typeof REASONS)[]]),
  details: z.string().max(2000).optional(),
});

type Target = { ownerId: string; label: string; text: string; link: string };

/**
 * Find what is being reported, whose it is, and a short excerpt for the email.
 * A message can only be reported by one of its two participants; everything
 * else here is public, so any signed-in user may report it.
 */
async function resolveTarget(type: (typeof TARGETS)[number], id: string, meId: string): Promise<Target | null> {
  switch (type) {
    case "JOB": {
      const j = await prisma.job.findUnique({ where: { id }, select: { customerId: true, title: true, description: true } });
      return j && { ownerId: j.customerId, label: `Job "${j.title}"`, text: j.description, link: `${SITE_URL}/jobs/${id}` };
    }
    case "BID": {
      const b = await prisma.bid.findUnique({ where: { id }, select: { welderId: true, jobId: true, message: true, amount: true } });
      return b && { ownerId: b.welderId, label: `Bid of $${b.amount}`, text: b.message, link: `${SITE_URL}/jobs/${b.jobId}` };
    }
    case "REVIEW": {
      const r = await prisma.review.findUnique({ where: { id }, select: { authorId: true, subjectId: true, comment: true, rating: true } });
      return r && { ownerId: r.authorId, label: `${r.rating}-star review`, text: r.comment, link: `${SITE_URL}/welders/${r.subjectId}` };
    }
    case "MESSAGE": {
      const m = await prisma.message.findUnique({ where: { id }, select: { fromId: true, toId: true, jobId: true, body: true } });
      if (!m || (m.fromId !== meId && m.toId !== meId)) return null;
      return { ownerId: m.fromId, label: "Private message", text: m.body, link: `${SITE_URL}/jobs/${m.jobId}` };
    }
    case "USER": {
      const u = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, name: true } });
      const link = u?.role === "WELDER" ? `${SITE_URL}/welders/${u.id}` : `${SITE_URL}/admin/users`;
      return u && { ownerId: u.id, label: `${u.name} (${u.role.toLowerCase()})`, text: "", link };
    }
    case "PRODUCT": {
      const p = await prisma.product.findUnique({ where: { id }, select: { supplierId: true, name: true, slug: true, description: true } });
      return p && { ownerId: p.supplierId, label: `Product "${p.name}"`, text: p.description, link: `${SITE_URL}/shop/p/${p.slug}` };
    }
  }
}

/**
 * POST — report content or a user. Ops is emailed straight away: the store
 * guidelines expect objectionable content to be acted on within 24 hours.
 * Reporting the same thing twice is accepted quietly and not re-sent.
 */
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a reason for the report." }, { status: 400 });
  const { targetType, targetId, reason } = parsed.data;
  const details = parsed.data.details?.trim() ?? "";

  const target = await resolveTarget(targetType, targetId, me.id);
  if (!target) return NextResponse.json({ error: "That content no longer exists." }, { status: 404 });
  if (target.ownerId === me.id) return NextResponse.json({ error: "You can't report your own content." }, { status: 400 });

  const existing = await prisma.report.findFirst({
    where: { reporterId: me.id, targetType, targetId, status: "OPEN" },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ ok: true, id: existing.id });

  const report = await prisma.report.create({
    data: { reporterId: me.id, targetType, targetId, targetUserId: target.ownerId, reason, details },
  });

  const owner = await prisma.user.findUnique({ where: { id: target.ownerId }, select: { name: true, email: true } });
  const to = opsAddress();
  if (!to) {
    console.error(`[report] OPS_EMAIL and EMAIL_FROM are unset — report ${report.id} (${targetType} ${targetId}) reached nobody.`);
  } else {
    const excerpt = target.text.slice(0, 600);
    const html = layout({
      preheader: `${me.name} reported ${target.label}: ${REASONS[reason]}`,
      heading: `Report: ${REASONS[reason]}`,
      body: `
        ${notice("Review within 24 hours", "Remove the content or ban the account from admin if it breaks the Terms, then reply to the reporter.")}
        <p style="margin:0 0 14px 0;"><strong>${escapeHtml(target.label)}</strong> by ${escapeHtml(owner?.name ?? "unknown")} (${escapeHtml(owner?.email ?? "")})</p>
        ${excerpt ? `<p style="margin:0 0 14px 0;white-space:pre-wrap;">${escapeHtml(excerpt)}</p>` : ""}
        <p style="margin:0 0 14px 0;">Reported by ${escapeHtml(me.name)} (${escapeHtml(me.email)})${details ? `: ${escapeHtml(details)}` : ""}</p>
        ${button(target.link, "Open the content")}
        ${button(`${SITE_URL}/admin/users`, "Open users in admin")}
      `,
    });
    const text = [
      `REPORT: ${REASONS[reason]} — review within 24 hours`,
      ``,
      `${target.label} by ${owner?.name ?? "unknown"} <${owner?.email ?? ""}>`,
      excerpt,
      ``,
      `Reported by ${me.name} <${me.email}>${details ? `: ${details}` : ""}`,
      target.link,
      `Report id ${report.id}`,
    ].join("\n");
    await sendMailSafe({ to, replyTo: me.email, subject: `[Report] ${REASONS[reason]} — ${target.label}`, html, text });
  }

  return NextResponse.json({ ok: true, id: report.id });
}
