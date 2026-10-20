import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/mobile-auth";

export type CurrentUser = {
  id: string;
  role: string;
  email: string;
  name: string;
  /** Set only for a mobile request: the device session the token belongs to. */
  mobileSessionId?: string;
};

/**
 * The signed-in user for an API route, from either the web or the mobile app.
 *
 * Web requests carry the NextAuth cookie; the mobile app sends
 * `Authorization: Bearer <access token>`. Every non-admin route uses this
 * instead of calling getServerSession directly, so one handler — one set of
 * rules — serves both clients. Admin routes stay cookie-only through
 * requireAdmin(): administration is not offered in the app.
 *
 * A Bearer header that fails verification is a 401, never a silent fall-back
 * to the cookie: a client that sent a token meant to be that user.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const auth = headers().get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return userFromBearer(auth.slice(7).trim());
  }

  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return null;
  return { id: u.id, role: u.role, email: u.email, name: u.name };
}

async function userFromBearer(token: string): Promise<CurrentUser | null> {
  const claims = await verifyAccessToken(token);
  if (!claims) return null;

  // Re-read the session and user on every request: role changes, bans and
  // sign-outs apply at once instead of after the token's 15 minutes run out.
  const session = await prisma.mobileSession.findUnique({
    where: { id: claims.sessionId },
    include: { user: { select: { id: true, role: true, email: true, name: true, banned: true } } },
  });
  if (
    !session ||
    session.userId !== claims.userId ||
    session.revokedAt ||
    session.expiresAt < new Date() ||
    session.user.banned
  ) {
    return null;
  }

  const { id, role, email, name } = session.user;
  return { id, role, email, name, mobileSessionId: session.id };
}
