import type { Prisma } from "@prisma/client";
import { notifyUsers } from "@/lib/push";

type Tx = Prisma.TransactionClient;
type ClosedBid = { welderId: string; jobId: string; title: string };

/**
 * Close the pending bids on jobs that are being cancelled.
 *
 * Cancelling used to touch only the job, so every bid on it stayed PENDING
 * forever: welders saw it under "My bids" and in their pending count with no
 * way to tell the job was gone. Every path that cancels a job calls this in
 * the same transaction. Accepted bids are left alone — they are the record of
 * who was awarded the work.
 */
export async function rejectPendingBids(tx: Tx, jobIds: string[]): Promise<ClosedBid[]> {
  if (jobIds.length === 0) return [];
  const bids = await tx.bid.findMany({
    where: { jobId: { in: jobIds }, status: "PENDING" },
    select: { welderId: true, jobId: true, job: { select: { title: true } } },
  });
  await tx.bid.updateMany({ where: { jobId: { in: jobIds }, status: "PENDING" }, data: { status: "REJECTED" } });
  return bids.map((b) => ({ welderId: b.welderId, jobId: b.jobId, title: b.job.title }));
}

/** Tell each welder whose bid was closed. Call after the transaction commits. */
export function notifyBidsClosed(closed: ClosedBid[]): void {
  for (const b of closed) {
    notifyUsers(b.welderId, {
      title: b.title,
      body: "This job was cancelled, so your bid is closed.",
      data: { type: "job", jobId: b.jobId },
    });
  }
}
