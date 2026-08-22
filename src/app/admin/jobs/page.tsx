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
    OPEN: "bg-green-600/15 text-green-700 border-green-600/30",
    ASSIGNED: "bg-blue-600/15 text-blue-700 border-blue-600/25",
    COMPLETED: "bg-slate-100 text-slate-500 border-slate-200",
    CANCELLED: "bg-red-600/15 text-brand border-red-600/25",
  };
  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">{jobs.length} total job postings</p>
        </div>
        <Link href="/admin/jobs/new" className="btn-primary shrink-0">+ New Job</Link>
      </div>
      <div className="grid gap-2">
        {jobs.map((j) => (
          <div key={j.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 transition-colors">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/jobs/${j.id}`} className="font-bold text-slate-900 hover:text-brand transition-colors">{j.title}</Link>
                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusColor[j.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>{j.status}</span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">{j.customer.name} · {j.city} · {j.category} · {j._count.bids} bids</div>
            </div>
            <JobRow id={j.id} currentStatus={j.status} />
          </div>
        ))}
        {jobs.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">No jobs yet.</div>}
      </div>
    </div>
  );
}
