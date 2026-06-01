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
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const { email, password, name, role, city, businessName } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email, passwordHash, name, role, city,
      welderProfile: role === "WELDER" ? { create: {} } : undefined,
      supplierProfile: role === "SUPPLIER" ? { create: { businessName: businessName || name } } : undefined,
    },
  });
  return NextResponse.json({ id: user.id });
}
