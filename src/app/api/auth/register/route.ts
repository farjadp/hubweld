import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["CUSTOMER", "WELDER", "SUPPLIER"]),
  city: z.string().optional(),
  businessName: z.string().optional(),
  // The Terms forbid objectionable content and abuse; the stores require users
  // to agree to them before they can post anything.
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Agree to the Terms of Service to create an account." }) }),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const terms = parsed.error.flatten().fieldErrors.acceptTerms?.[0];
    return NextResponse.json({ error: terms ?? "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password, name, role, city, businessName } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email, passwordHash, name, role, city,
      termsAcceptedAt: new Date(),
      welderProfile: role === "WELDER" ? { create: {} } : undefined,
      supplierProfile: role === "SUPPLIER" ? { create: { businessName: businessName || name } } : undefined,
    },
  });
  return NextResponse.json({ id: user.id });
}
