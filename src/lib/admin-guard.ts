import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Admin check for API routes.
 *
 * Every admin route used to carry its own copy of this, and the copies drifted:
 * some guarded only the mutating methods, so `GET /api/admin/blog/posts`
 * handed unpublished drafts to anyone who asked. One helper, called at the top
 * of every handler under /api/admin, is the only way to keep that from
 * happening again.
 */
export async function requireAdmin(): Promise<{ id: string; role: string; email: string; name: string } | null> {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") return null;
  return me;
}

/** The 403 body every admin route returns, so the client sees one shape. */
export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
