import { prisma } from "@/lib/prisma";

/**
 * Everyone the viewer must not see or hear from: users they blocked and users
 * who blocked them. A block works both ways, so a blocked user cannot keep
 * bidding on, messaging or reviewing the person who blocked them.
 *
 * Signed-out viewers block no one, so lists stay public as before.
 */
export async function hiddenUserIds(viewerId: string | null | undefined): Promise<string[]> {
  if (!viewerId) return [];
  const rows = await prisma.userBlock.findMany({
    where: { OR: [{ blockerId: viewerId }, { blockedId: viewerId }] },
    select: { blockerId: true, blockedId: true },
  });
  return [...new Set(rows.map((r) => (r.blockerId === viewerId ? r.blockedId : r.blockerId)))];
}

/** True if either user has blocked the other. */
export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const row = await prisma.userBlock.findFirst({
    where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] },
    select: { id: true },
  });
  return !!row;
}
