import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

/**
 * Token auth for the mobile app.
 *
 * The web app signs in with a NextAuth cookie, which a native app cannot hold
 * the same way. The app instead gets two tokens at sign-in:
 *
 *   - an ACCESS token: a short-lived JWT sent as `Authorization: Bearer ...`.
 *   - a REFRESH token: an opaque random string, stored server-side only as a
 *     SHA-256 hash in `MobileSession`, swapped for a new pair on every use.
 *
 * Rotation means a refresh token works once. The app must therefore run at
 * most one refresh at a time — two concurrent refreshes with the same token
 * will sign the second one out.
 *
 * Every authenticated request re-reads the session row (see current-user.ts),
 * so signing out, or an admin banning the account, takes effect immediately
 * rather than when the access token happens to expire.
 */

const ISSUER = "hubweld";
const AUDIENCE = "hubweld-mobile";
export const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days, sliding

function secret(): Uint8Array {
  const raw = process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!raw) throw new Error("MOBILE_JWT_SECRET (or NEXTAUTH_SECRET) must be set to issue mobile tokens");
  return new TextEncoder().encode(raw);
}

function hashRefresh(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function newRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

async function signAccess(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(secret());
}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
};

/** Open a new device session for a user who has just proved who they are. */
export async function openMobileSession(
  userId: string,
  device: { deviceName?: string; platform?: string }
): Promise<TokenPair> {
  const refreshToken = newRefreshToken();
  const session = await prisma.mobileSession.create({
    data: {
      userId,
      refreshHash: hashRefresh(refreshToken),
      deviceName: (device.deviceName ?? "").slice(0, 120),
      platform: (device.platform ?? "").slice(0, 20),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return {
    accessToken: await signAccess(userId, session.id),
    refreshToken,
    expiresIn: ACCESS_TTL_SECONDS,
  };
}

/**
 * Swap a refresh token for a new pair. Returns null when the token is unknown,
 * already used, revoked, expired, or belongs to a banned account.
 */
export async function rotateMobileSession(refreshToken: string): Promise<TokenPair | null> {
  const session = await prisma.mobileSession.findUnique({
    where: { refreshHash: hashRefresh(refreshToken) },
    include: { user: { select: { banned: true } } },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date() || session.user.banned) {
    return null;
  }

  const next = newRefreshToken();
  // Conditional on the old hash so two racing refreshes cannot both succeed.
  const { count } = await prisma.mobileSession.updateMany({
    where: { id: session.id, refreshHash: session.refreshHash, revokedAt: null },
    data: {
      refreshHash: hashRefresh(next),
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  if (count === 0) return null;

  return {
    accessToken: await signAccess(session.userId, session.id),
    refreshToken: next,
    expiresIn: ACCESS_TTL_SECONDS,
  };
}

/** Sign a device out. The push token goes with it, so it stops receiving alerts. */
export async function revokeMobileSession(sessionId: string): Promise<void> {
  await prisma.mobileSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date(), pushToken: null },
  });
}

/** Verify an access token's signature and lifetime. Does not touch the database. */
export async function verifyAccessToken(token: string): Promise<{ userId: string; sessionId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER, audience: AUDIENCE });
    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") return null;
    return { userId: payload.sub, sessionId: payload.sid };
  } catch {
    return null;
  }
}
