import { NextResponse } from "next/server";
import { z } from "zod";
import { rotateMobileSession } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

const schema = z.object({ refreshToken: z.string().min(20).max(200) });

/** Swap a refresh token for a new access + refresh pair. The old one stops working. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const tokens = await rotateMobileSession(parsed.data.refreshToken);
  if (!tokens) return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });
  return NextResponse.json(tokens);
}
