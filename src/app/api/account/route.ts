import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
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
