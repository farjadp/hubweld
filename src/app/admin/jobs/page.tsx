import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import JobRow from "./JobRow";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");
  const jobs = await prisma.job.findMany({ include: { customer: true, _count: { select: { bids: true } } }, orderBy: { createdAt: "desc" } });
  const statusColor: Record<string, string> = {
    OPEN: "bg-green-600/15 text-green-400 border-green-600/25",
    ASSIGNED: "bg-blue-600/15 text-blue-400 border-blue-600/25",
    COMPLETED: "bg-white/10 text-white/40 border-white/10",
    CANCELLED: "bg-red-600/15 text-red-400 border-red-600/25",
  };
  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Jobs</h1>
          <p className="mt-1 text-sm text-white/40">{jobs.length} total job postings</p>
        </div>
        <Link href="/admin/jobs/new" className="btn-primary shrink-0">+ New Job</Link>
      </div>
      <div className="grid gap-2">
        {jobs.map((j) => (
          <div key={j.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#111315] px-5 py-4 hover:border-white/20 transition-colors">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/jobs/${j.id}`} className="font-bold text-white hover:text-red-400 transition-colors">{j.title}</Link>
                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusColor[j.status] ?? "bg-white/10 text-white/40 border-white/10"}`}>{j.status}</span>
              </div>
              <div className="mt-0.5 text-xs text-white/40">{j.customer.name} · {j.city} · {j.category} · {j._count.bids} bids</div>
            </div>
            <JobRow id={j.id} currentStatus={j.status} />
          </div>
        ))}
        {jobs.length === 0 && <div className="rounded-xl border border-white/10 bg-[#111315] p-10 text-center text-sm text-white/30">No jobs yet.</div>}
      </div>
    </div>
  );
}
