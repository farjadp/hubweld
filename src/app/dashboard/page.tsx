import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");
  const me = session.user as any;

  if (me.role === "CUSTOMER") {
    const jobs = await prisma.job.findMany({ where: { customerId: me.id }, include: { _count: { select: { bids: true } } }, orderBy: { createdAt: "desc" } });
    return (
      <Wrapper title={`Welcome, ${me.name}`} subtitle="Your posted jobs and bids overview.">
        <div className="mb-4 flex justify-end"><Link href="/jobs/new" className="btn-primary">Post a Job</Link></div>
        <Stats items={[["Active jobs", jobs.filter((j) => j.status !== "COMPLETED" && j.status !== "CANCELLED").length], ["Total bids received", jobs.reduce((a, j) => a + j._count.bids, 0)], ["Completed", jobs.filter((j) => j.status === "COMPLETED").length]]} />
        <h3 className="mt-8 mb-2 font-bold">My jobs</h3>
        {jobs.length === 0 ? <p className="text-white/60">No jobs yet. Post your first one.</p> : (
          <ul className="grid gap-3">{jobs.map((j) => (
            <li key={j.id} className="card flex items-center justify-between">
              <div><Link href={`/jobs/${j.id}`} className="font-bold hover:text-amber">{j.title}</Link><div className="text-xs text-white/60">{j.city} · {j.category} · {j._count.bids} bids</div></div>
              <span className="badge bg-white/10">{j.status}</span>
            </li>
          ))}</ul>
        )}
      </Wrapper>
    );
  }

  if (me.role === "WELDER") {
    const [bids, profile] = await Promise.all([
      prisma.bid.findMany({ where: { welderId: me.id }, include: { job: true }, orderBy: { createdAt: "desc" } }),
      prisma.welderProfile.findUnique({ where: { userId: me.id } }),
    ]);
    const activeJobs = bids.filter((b) => b.status === "ACCEPTED" && (b.job.status === "ASSIGNED" || b.job.status === "IN_PROGRESS"));
    const completedJobs = bids.filter((b) => b.status === "ACCEPTED" && b.job.status === "COMPLETED");
    const pendingBids = bids.filter((b) => b.status === "PENDING");

    const statusColor: Record<string, string> = {
      ASSIGNED: "bg-amber-600/20 text-amber-400",
      IN_PROGRESS: "bg-violet-600/20 text-violet-400",
      COMPLETED: "bg-green-600/20 text-green-400",
      PENDING: "bg-white/10 text-white/60",
      REJECTED: "bg-red-900/20 text-red-400/60",
    };

    return (
      <Wrapper title={`Welcome, ${me.name}`} subtitle="Your active jobs, bids, and profile.">
        <div className="mb-4 flex flex-wrap justify-between gap-2">
          <Link href="/jobs" className="btn-secondary">Browse Jobs</Link>
          <Link href="/dashboard/profile" className="btn-primary">{profile?.approved ? "Edit profile" : "Complete profile →"}</Link>
        </div>

        {!profile?.approved && (
          <div className="mb-4 rounded-xl border border-amber-600/30 bg-amber-600/10 p-4 text-sm text-amber-300">
            ⚠ Complete your profile to appear in the directory and attract more clients.
          </div>
        )}

        <Stats items={[
          ["Active jobs", activeJobs.length],
          ["Pending bids", pendingBids.length],
          ["Completed", completedJobs.length],
        ]} />

        {/* Active / In-progress jobs */}
        {activeJobs.length > 0 && (
          <>
            <h3 className="mt-8 mb-2 font-bold">Active Jobs</h3>
            <ul className="grid gap-3">
              {activeJobs.map((b) => (
                <li key={b.id} className="card flex items-center justify-between border-violet-600/20">
                  <div>
                    <Link href={`/jobs/${b.jobId}`} className="font-bold hover:text-red-400">{b.job.title}</Link>
                    <div className="text-xs text-white/60">{b.job.city} · ${b.amount}</div>
                  </div>
                  <span className={`badge ${statusColor[b.job.status] ?? "bg-white/10"}`}>{b.job.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Pending bids */}
        <h3 className="mt-8 mb-2 font-bold">My Bids</h3>
        {bids.length === 0 ? <p className="text-white/60">No bids yet. Browse open jobs.</p> : (
          <ul className="grid gap-3">
            {bids.filter((b) => b.status !== "ACCEPTED" || !["ASSIGNED","IN_PROGRESS","COMPLETED"].includes(b.job.status)).map((b) => (
              <li key={b.id} className="card flex items-center justify-between">
                <div>
                  <Link href={`/jobs/${b.jobId}`} className="font-bold hover:text-red-400">{b.job.title}</Link>
                  <div className="text-xs text-white/60">{b.job.city} · ${b.amount}</div>
                </div>
                <span className={`badge ${statusColor[b.status] ?? "bg-white/10"}`}>{b.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Wrapper>
    );
  }

  if (me.role === "SUPPLIER") redirect("/dashboard/supplier");

  // ADMIN
  redirect("/admin");
}

function Wrapper({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">{title}</h1>
      <p className="mb-6 text-white/60">{subtitle}</p>
      {children}
    </div>
  );
}
function Stats({ items }: { items: [string, number][] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map(([l, v]) => <div key={l} className="card"><div className="text-3xl font-black">{v}</div><div className="text-sm text-white/60">{l}</div></div>)}
    </div>
  );
}
