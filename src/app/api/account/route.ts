import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/uploads";
import { parseGallery } from "@/lib/api-dto";
import { notifyBidsClosed } from "@/lib/jobs";

/**
 * Account self-service for every signed-in role.
 *
 * Previously only welders could edit anything about themselves, and nobody —
 * including admins — could change their own password from inside the app.
 */
const schema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    city: z.string().max(120).optional(),
    phone: z.string().max(40).optional(),
    // Supplier-only fields; ignored for other roles.
    businessName: z.string().max(160).optional(),
    description: z.string().max(2000).optional(),
    website: z.string().max(300).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "New password must be at least 8 characters").optional(),
  })
  .refine((d) => !d.newPassword || !!d.currentPassword, {
    message: "Enter your current password to set a new one",
    path: ["currentPassword"],
  });

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return NextResponse.json({ error: first?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.city !== undefined) data.city = d.city;
  if (d.phone !== undefined) data.phone = d.phone;

  if (d.newPassword) {
    const ok = await bcrypt.compare(d.currentPassword ?? "", user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    data.passwordHash = await bcrypt.hash(d.newPassword, 10);
  }

  await prisma.user.update({ where: { id: me.id }, data });

  // Suppliers own their storefront details; approval stays an admin decision.
  if (user.role === "SUPPLIER" && (d.businessName !== undefined || d.description !== undefined || d.website !== undefined)) {
    await prisma.supplierProfile.upsert({
      where: { userId: me.id },
      create: {
        userId: me.id,
        businessName: d.businessName ?? user.name,
        description: d.description ?? "",
        website: d.website ?? "",
      },
      update: {
        ...(d.businessName !== undefined ? { businessName: d.businessName } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.website !== undefined ? { website: d.website } : {}),
      },
    });
  }

  return NextResponse.json({ ok: true });
}

const deleteSchema = z.object({ password: z.string().min(1, "Enter your password to delete your account") });

/**
 * Delete your own account.
 *
 * Required by both app stores for any app that lets people sign up (Apple
 * 5.1.1(v), Google Play's account-deletion policy), and offered on the web for
 * the same reason.
 *
 * The account is anonymised rather than hard-deleted. `Order` cascades from
 * `User`, so a real delete would erase sales records that have to be kept for
 * tax purposes, and the other party's side of a job or a conversation would
 * vanish with it. What is removed is everything that identifies the person:
 * name, email, phone, city, password, the welder profile with its photos and
 * résumé, the storefront details, the cart and every device session. Orders
 * keep the shipping details given at checkout, because those are the record
 * of the sale.
 */
export async function DELETE(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (me.role === "ADMIN") {
    return NextResponse.json({ error: "Admin accounts are removed by another admin, not from here." }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: me.id }, include: { welderProfile: true } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });
  }

  const files = user.welderProfile
    ? [user.welderProfile.avatarUrl, user.welderProfile.resumeUrl, ...parseGallery(user.welderProfile.galleryJson)]
        // Only our own uploads; a pasted external URL is not ours to unlink.
        .filter((u) => u.startsWith("/api/files/") || u.startsWith("/uploads/"))
    : [];

  // Bidders on the jobs being cancelled below, to tell them once it commits.
  const closingBids = await prisma.bid.findMany({
    where: { status: "PENDING", job: { customerId: me.id, status: "OPEN" } },
    select: { welderId: true, jobId: true, job: { select: { title: true } } },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: me.id },
      data: {
        email: `deleted-${me.id}@deleted.invalid`,
        name: "Deleted user",
        // A random hash nobody knows: the account can never be signed into again.
        passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
        city: null,
        phone: null,
        banned: true,
      },
    }),
    prisma.welderProfile.deleteMany({ where: { userId: me.id } }),
    prisma.supplierProfile.updateMany({
      where: { userId: me.id },
      data: { businessName: "Deleted supplier", description: "", website: "", logoUrl: "", approved: false },
    }),
    // Off the shelves, but kept so past order lines still point somewhere.
    prisma.product.updateMany({ where: { supplierId: me.id }, data: { status: "ARCHIVED", featured: false } }),
    // Nobody is left to award open jobs or to do the work for pending bids.
    // Bids first: the filter relies on the jobs still being OPEN.
    prisma.bid.updateMany({ where: { status: "PENDING", job: { customerId: me.id, status: "OPEN" } }, data: { status: "REJECTED" } }),
    prisma.job.updateMany({ where: { customerId: me.id, status: "OPEN" }, data: { status: "CANCELLED" } }),
    prisma.bid.deleteMany({ where: { welderId: me.id, status: "PENDING" } }),
    prisma.cart.deleteMany({ where: { userId: me.id } }),
    prisma.mobileSession.deleteMany({ where: { userId: me.id } }),
  ]);

  notifyBidsClosed(closingBids.map((b) => ({ welderId: b.welderId, jobId: b.jobId, title: b.job.title })));

  // After the commit: a failed unlink must not undo the deletion.
  await Promise.all(files.map((url) => deleteUpload(url)));

  return NextResponse.json({ ok: true });
}
