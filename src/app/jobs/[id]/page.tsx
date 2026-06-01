import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import BidForm from "./BidForm";
import AcceptBidButton from "./AcceptBidButton";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { customer: true, bids: { include: { welder: { include: { welderProfile: true } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!job) notFound();
  const me = session?.user as any | undefined;
  const isOwner = me?.id === job.customerId;
  const isWelder = me?.role === "WELDER";
  const myBid = isWelder ? job.bids.find((b) => b.welderId === me.id) : null;

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">{job.title}</h1>
          <span className="badge bg-white/10">{job.status}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span className="inline-flex items-center gap-1"><MapPin size={14} /> {job.city}</span>
          <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {job.category}</span>
          <span>by {job.customer.name}</span>
        </div>
        <p className="mt-4 whitespace-pre-line text-white/80">{job.description}</p>
        {job.budget && <p className="mt-3 text-amber">Budget: ${job.budget}</p>}

        <h3 className="mt-8 mb-3 font-bold">Bids ({job.bids.length})</h3>
        {job.bids.length === 0 ? <p className="text-white/60">No bids yet.</p> : (
          <ul className="space-y-3">
            {job.bids.map((b) => (
              <li key={b.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/welders/${b.welderId}`} className="font-bold hover:text-amber">{b.welder.name}</Link>
                  <span className="text-amber font-bold">${b.amount}</span>
                </div>
                {b.message && <p className="mt-1 text-sm text-white/70">{b.message}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-white/50">{b.status}</span>
                  {isOwner && job.status === "OPEN" && b.status === "PENDING" && <AcceptBidButton jobId={job.id} bidId={b.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="card h-fit space-y-4">
        {!session && (<><p className="text-white/70">Sign in to bid or message.</p><Link href={`/login?callbackUrl=/jobs/${job.id}`} className="btn-primary w-full">Sign in</Link></>)}
        {isWelder && job.status === "OPEN" && !myBid && <BidForm jobId={job.id} />}
        {myBid && <p className="text-sm text-white/70">You bid <span className="text-amber font-bold">${myBid.amount}</span> ({myBid.status}).</p>}
        {isOwner && <Link href="/dashboard/jobs" className="btn-secondary w-full">Manage my jobs</Link>}
      </aside>
    </div>
  );
}
