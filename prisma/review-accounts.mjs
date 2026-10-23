/**
 * Create (or reset) the App Store / Google Play review accounts from a shell.
 *
 * Same job as the "Create / reset" button on /admin/users
 * (src/app/api/admin/review-accounts/route.ts), for when the admin page is not
 * an option. Keep the two in step. Plain ESM JavaScript so it runs in the
 * production container, where tsx is not installed:
 *
 *   railway ssh --service hubweld node prisma/review-accounts.mjs
 *
 * Every run issues new passwords, pushes the expiry 30 days out and revokes
 * the accounts' mobile sessions. Passwords are printed once and stored hashed.
 */
import { randomBytes } from "crypto";
import { createRequire } from "module";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// bcryptjs is inlined into the Next bundle, so the package is not resolvable
// from here in the production image. A vendored copy (same version, MIT) sits
// beside this script; hashes match what the login route checks.
const bcrypt = createRequire(import.meta.url)("./vendor/bcrypt.cjs");

const prisma = new PrismaClient();
const DAYS = 30;

const ACCOUNTS = [
  { key: "customer", email: "review.customer@hubweld.ca", name: "Review Customer", role: "CUSTOMER" },
  { key: "welder", email: "review.welder@hubweld.ca", name: "Review Welder", role: "WELDER" },
  { key: "supplier", email: "review.supplier@hubweld.ca", name: "Review Supplier", role: "SUPPLIER" },
];

const DEMO_JOB_TITLE = "Gate hinge repair (app review demo)";

/** Readable but strong: 4 groups of 4 from an alphabet without look-alikes. */
function password() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const chars = [...randomBytes(16)].map((b) => abc[b % abc.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

async function main() {
  const accessExpiresAt = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000);
  const issued = [];
  const ids = {};

  for (const a of ACCOUNTS) {
    const pw = password();
    const passwordHash = await bcrypt.hash(pw, 10);
    const user = await prisma.user.upsert({
      where: { email: a.email },
      create: { email: a.email, name: a.name, role: a.role, city: "Toronto", passwordHash, accessExpiresAt, termsAcceptedAt: new Date() },
      update: { passwordHash, accessExpiresAt, banned: false, role: a.role },
    });
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

  console.log(`Review accounts ready. Valid until ${accessExpiresAt.toISOString().slice(0, 10)}.\n`);
  for (const a of issued) console.log(`${a.role.padEnd(9)} ${a.email.padEnd(28)} ${a.password}`);
}

main()
  .catch((e) => {
    console.error("Review accounts failed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
