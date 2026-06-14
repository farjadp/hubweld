import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { MapPin, Briefcase, BadgeCheck } from "lucide-react";
import BidForm from "./BidForm";
import AcceptBidButton from "./AcceptBidButton";
import JobStatusButtons from "./JobStatusButtons";
import ReviewForm from "./ReviewForm";
import MessageThread from "./MessageThread";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  OPEN:        "border-blue-600/30 bg-blue-600/10 text-blue-400",
  ASSIGNED:    "border-amber-600/30 bg-amber-600/10 text-amber-400",
  IN_PROGRESS: "border-violet-600/30 bg-violet-600/10 text-violet-400",
  COMPLETED:   "border-green-600/30 bg-green-600/10 text-green-400",
  CANCELLED:   "border-red-900/30 bg-red-900/10 text-red-500",
};

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      bids: { include: { welder: { include: { welderProfile: true } } }, orderBy: { createdAt: "desc" } },
      reviews: { include: { author: { select: { name: true } } } },
    },
  });
  if (!job) notFound();
  const me = session?.user as any;
  const isOwner = me?.id === job.customerId;
  const isWelder = me?.role === "WELDER";
  const acceptedBid = job.bids.find((b) => b.status === "ACCEPTED");
  const isAssignedWelder = isWelder && acceptedBid?.welderId === me?.id;
  const myBid = isWelder ? job.bids.find((b) => b.welderId === me.id) : null;
  const canMessage = me && (isOwner || (isWelder && !!myBid));
  const alreadyReviewed = isOwner && job.reviews.some((r) => r.authorId === me.id);
  const statusStyle = STATUS_STYLES[job.status] ?? "bg-white/10 text-white/60";

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      {/* Main */}
      <div className="space-y-6">
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight">{job.title}</h1>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${statusStyle}`}>
              {job.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-1"><MapPin size={14} /> {job.city}</span>
            <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {job.category}</span>
            <span>by {job.customer.name}</span>
          </div>
          <p className="mt-4 whitespace-pre-line text-white/80">{job.description}</p>
          {job.budget && <p className="mt-3 font-bold text-red-400">Budget: ${job.budget}</p>}
        </div>

        {/* Bids */}
        <div className="card">
          <h3 className="mb-3 font-bold">Bids ({job.bids.length})</h3>
          {job.bids.length === 0 ? <p className="text-white/60">No bids yet.</p> : (
            <ul className="space-y-3">
              {job.bids.map((b) => (
                <li key={b.id} className={`rounded-xl border p-4 ${b.status === "ACCEPTED" ? "border-green-600/30 bg-green-600/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link href={`/welders/${b.welderId}`} className="font-bold hover:text-red-400">{b.welder.name}</Link>
                      {b.welder.welderProfile?.approved && <BadgeCheck size={14} className="text-green-400" />}
                    </div>
                    <span className="font-bold text-red-400">${b.amount}</span>
                  </div>
                  {b.message && <p className="mt-1 text-sm text-white/70">{b.message}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs font-bold ${b.status === "ACCEPTED" ? "text-green-400" : b.status === "REJECTED" ? "text-red-400/60" : "text-white/50"}`}>
                      {b.status}
                    </span>
                    {isOwner && job.status === "OPEN" && b.status === "PENDING" && <AcceptBidButton jobId={job.id} bidId={b.id} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reviews (after completion) */}
        {job.status === "COMPLETED" && (
          <div className="card">
            <h3 className="mb-3 font-bold">Reviews</h3>
            {job.reviews.length === 0 ? (
              <p className="text-sm text-white/50">No reviews yet.</p>
            ) : (
              <ul className="space-y-3 mb-4">
                {job.reviews.map((r) => (
                  <li key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-amber-400">{"★".repeat(r.rating)}<span className="text-white/20">{"★".repeat(5 - r.rating)}</span></div>
                    {r.comment && <p className="mt-1 text-sm text-white/80">{r.comment}</p>}
                    <div className="mt-1 text-xs text-white/40">— {r.author.name}</div>
                  </li>
                ))}
              </ul>
            )}
            {isOwner && !alreadyReviewed && <ReviewForm jobId={job.id} />}
            {isOwner && alreadyReviewed && <p className="text-sm text-green-400">✓ You have already reviewed this job.</p>}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="card h-fit space-y-4">
          {!session && (
            <>
              <p className="text-white/70">Sign in to bid or message.</p>
              <Link href={`/login?callbackUrl=/jobs/${job.id}`} className="btn-primary w-full text-center block">Sign in</Link>
            </>
          )}

          {/* Welder: bid or show status */}
          {isWelder && job.status === "OPEN" && !myBid && <BidForm jobId={job.id} />}
          {myBid && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="text-white/60">Your bid</div>
              <div className="font-bold text-red-400">${myBid.amount}</div>
              <div className={`text-xs mt-1 font-bold ${myBid.status === "ACCEPTED" ? "text-green-400" : myBid.status === "REJECTED" ? "text-red-400/60" : "text-white/50"}`}>
                {myBid.status}
              </div>
            </div>
          )}

          {/* Status transition buttons */}
          {me && (isOwner || isAssignedWelder) && (
            <JobStatusButtons
              jobId={job.id}
              status={job.status}
              isOwner={isOwner}
              isAssignedWelder={isAssignedWelder}
            />
          )}

          {isOwner && <Link href="/dashboard" className="btn-secondary w-full text-center block">Manage my jobs</Link>}
        </div>

        {/* Messaging */}
        {canMessage && job.status !== "CANCELLED" && (
          <div className="card">
            <MessageThread jobId={job.id} myId={me.id} />
          </div>
        )}
      </aside>
    </div>
  );
}
