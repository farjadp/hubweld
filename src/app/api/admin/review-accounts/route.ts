import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

const DAYS = 30;

const ACCOUNTS = [
  { key: "customer", email: "review.customer@hubweld.ca", name: "Review Customer", role: "CUSTOMER" },
  { key: "welder", email: "review.welder@hubweld.ca", name: "Review Welder", role: "WELDER" },
  { key: "supplier", email: "review.supplier@hubweld.ca", name: "Review Supplier", role: "SUPPLIER" },
] as const;

const DEMO_JOB_TITLE = "Gate hinge repair (app review demo)";

/** Readable but strong: 4 groups of 4 from an alphabet without look-alikes. */
function password(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  const chars = [...bytes].map((b) => abc[b % abc.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

/**
 * POST — create (or reset) the three App Store / Google Play review accounts.
 *
 * Every call issues new passwords and pushes the expiry 30 days out, so the
 * same button serves a resubmission. The passwords are returned once, to the
 * admin who pressed it, and never stored in readable form.
 *
 * Demo data so a reviewer can see each role working without touching real
 * users: the customer owns one open job, the welder has bid on it and sent a
 * message, and the supplier has a draft (unpublished) product.
 */
export async function POST() {
  const me = await requireAdmin();
  if (!me) {
    console.warn("[review-accounts] refused: no admin session");
    return forbidden();
  }
  try {
    return await createAccounts();
  } catch (e) {
    // Surface the real cause in the admin's alert and in the Railway logs.
    console.error("[review-accounts] failed", e);
    const message = e instanceof Error ? e.message.split("\n").filter(Boolean).pop() : String(e);
    return NextResponse.json({ error: `Review accounts failed: ${message}` }, { status: 500 });
  }
}

async function createAccounts() {

  const accessExpiresAt = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000);
  const issued: { role: string; email: string; password: string }[] = [];
  const ids: Record<string, string> = {};

  for (const a of ACCOUNTS) {
    const pw = password();
    const passwordHash = await bcrypt.hash(pw, 10);
    const user = await prisma.user.upsert({
      where: { email: a.email },
      create: { email: a.email, name: a.name, role: a.role, city: "Toronto", passwordHash, accessExpiresAt, termsAcceptedAt: new Date() },
      update: { passwordHash, accessExpiresAt, banned: false, role: a.role },
    });
    // Old sessions from a previous review round stop working with the new password.
    await prisma.mobileSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    ids[a.key] = user.id;
    issued.push({ role: a.role, email: a.email, password: pw });
  }

  await prisma.welderProfile.upsert({
    where: { userId: ids.welder },
    create: {
      userId: ids.welder,
      bio: "Demo welder profile for app review. Structural and repair work, shop and mobile.",
      skills: "MIG,TIG,Stick,Structural",
      certifications: "CWB W47.1 (demo)",
      serviceArea: "Toronto",
      hourlyRate: 85,
      yearsExp: 8,
      country: "Canada",
      approved: true,
    },
    update: { approved: true },
  });
  await prisma.supplierProfile.upsert({
    where: { userId: ids.supplier },
    create: { userId: ids.supplier, businessName: "Review Supplier Co.", description: "Demo supplier account for app review.", approved: true },
    update: { approved: true },
  });

  let job = await prisma.job.findFirst({ where: { customerId: ids.customer, title: DEMO_JOB_TITLE } });
  if (!job) {
    job = await prisma.job.create({
      data: {
        customerId: ids.customer,
        title: DEMO_JOB_TITLE,
        description: "Demo job for app review: a steel driveway gate has a cracked hinge that needs cutting out and re-welding.",
        city: "Toronto",
        category: "repair",
        budget: 350,
      },
    });
  }
  const bid = await prisma.bid.findUnique({ where: { jobId_welderId: { jobId: job.id, welderId: ids.welder } } });
  if (!bid) {
    await prisma.bid.create({ data: { jobId: job.id, welderId: ids.welder, amount: 320, message: "I can do this on site with a mobile rig this week." } });
    await prisma.message.create({ data: { jobId: job.id, fromId: ids.welder, toId: ids.customer, body: "Hi, could you send a photo of the hinge?" } });
  }

  const hasProduct = await prisma.product.findFirst({ where: { supplierId: ids.supplier }, select: { id: true } });
  const category = await prisma.productCategory.findFirst({ select: { id: true } });
  if (!hasProduct && category) {
    await prisma.product.create({
      data: {
        supplierId: ids.supplier,
        categoryId: category.id,
        slug: `review-demo-${ids.supplier.slice(-6)}`,
        name: "Demo welding gloves (review)",
        description: "Draft listing for app review. Not shown in the shop.",
        priceCents: 2999,
        stock: 10,
        status: "DRAFT",
      },
    });
  }

  return NextResponse.json({ expiresAt: accessExpiresAt.toISOString(), accounts: issued });
}
