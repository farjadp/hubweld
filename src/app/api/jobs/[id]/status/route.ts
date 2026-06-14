import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { status } = await req.json();
  const job = await prisma.job.findUnique({ where: { id: params.id }, include: { bids: true } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const isOwner = job.customerId === me.id;
  const acceptedBid = job.bids.find((b) => b.status === "ACCEPTED");
  const isAssignedWelder = me.role === "WELDER" && acceptedBid?.welderId === me.id;
  const isAdmin = me.role === "ADMIN";

  // Allowed transitions:
  // ASSIGNED → IN_PROGRESS: assigned welder or owner or admin
  // IN_PROGRESS → COMPLETED: owner or admin
  // * → CANCELLED: owner or admin (only if not already COMPLETED)
  const allowed =
    (status === "IN_PROGRESS" && job.status === "ASSIGNED" && (isAssignedWelder || isOwner || isAdmin)) ||
    (status === "COMPLETED" && job.status === "IN_PROGRESS" && (isOwner || isAdmin)) ||
    (status === "CANCELLED" && job.status !== "COMPLETED" && (isOwner || isAdmin));

  if (!allowed) return NextResponse.json({ error: "Transition not allowed" }, { status: 403 });

  await prisma.job.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ ok: true });
}
