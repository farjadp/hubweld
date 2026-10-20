import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toWelderProfile } from "@/lib/api-dto";
import type { Me, Role } from "@/lib/api-types";

export const dynamic = "force-dynamic";

/** The signed-in account, with its role's profile and the cart badge count. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: me.id },
    include: { welderProfile: true, supplierProfile: true, cart: { include: { items: { select: { quantity: true } } } } },
  });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const body: Me = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    city: user.city,
    phone: user.phone,
    cartCount: user.cart?.items.reduce((a, i) => a + i.quantity, 0) ?? 0,
    welderProfile: user.welderProfile ? toWelderProfile(user.welderProfile) : null,
    supplierProfile: user.supplierProfile
      ? {
          businessName: user.supplierProfile.businessName,
          description: user.supplierProfile.description,
          website: user.supplierProfile.website,
          logoUrl: user.supplierProfile.logoUrl,
          approved: user.supplierProfile.approved,
        }
      : null,
  };
  return NextResponse.json(body);
}
