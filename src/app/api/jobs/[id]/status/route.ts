import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { notifyUsers } from "@/lib/push";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
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

  // Tell the other side of the job, never the person who made the change.
  const label: Record<string, string> = { IN_PROGRESS: "is in progress", COMPLETED: "is complete", CANCELLED: "was cancelled" };
  notifyUsers(
    [job.customerId, acceptedBid?.welderId ?? ""].filter((id) => id && id !== me.id),
    { title: job.title, body: `This job ${label[status] ?? "was updated"}.`, data: { type: "job", jobId: job.id } }
  );
  return NextResponse.json({ ok: true });
}
