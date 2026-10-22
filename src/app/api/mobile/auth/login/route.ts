import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { openMobileSession } from "@/lib/mobile-auth";
import type { AuthResponse, Role } from "@/lib/api-types";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceName: z.string().max(120).optional(),
  platform: z.enum(["ios", "android"]).optional(),
});

/**
 * Mobile sign-in. Same credential rules as the web's NextAuth provider
 * (src/lib/auth.ts): unknown email, wrong password and banned account all get
 * the same answer, so the endpoint does not confirm which emails exist.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your email and password" }, { status: 400 });
  const { email, password, deviceName, platform } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const expired = !!user?.accessExpiresAt && user.accessExpiresAt < new Date();
  const ok = !!user && !user.banned && !expired && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });

  const tokens = await openMobileSession(user.id, { deviceName, platform });
  const body: AuthResponse = {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, role: user.role as Role },
  };
  return NextResponse.json(body);
}
