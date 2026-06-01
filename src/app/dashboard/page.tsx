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
    const bids = await prisma.bid.findMany({ where: { welderId: me.id }, include: { job: true }, orderBy: { createdAt: "desc" } });
    const profile = await prisma.welderProfile.findUnique({ where: { userId: me.id } });
    return (
      <Wrapper title={`Welcome, ${me.name}`} subtitle="Your bids, assigned jobs, and profile.">
        <div className="mb-4 flex flex-wrap justify-between gap-2">
          <Link href="/jobs" className="btn-secondary">Browse Jobs</Link>
          <Link href="/dashboard/profile" className="btn-primary">{profile?.approved ? "Edit profile" : "Complete profile"}</Link>
        </div>
        <Stats items={[["Active bids", bids.filter((b) => b.status === "PENDING").length], ["Won", bids.filter((b) => b.status === "ACCEPTED").length], ["Total bids", bids.length]]} />
        <h3 className="mt-8 mb-2 font-bold">My bids</h3>
        {bids.length === 0 ? <p className="text-white/60">No bids yet. Browse open jobs.</p> : (
          <ul className="grid gap-3">{bids.map((b) => (
            <li key={b.id} className="card flex items-center justify-between">
              <div><Link href={`/jobs/${b.jobId}`} className="font-bold hover:text-amber">{b.job.title}</Link><div className="text-xs text-white/60">{b.job.city} · ${b.amount}</div></div>
              <span className="badge bg-white/10">{b.status}</span>
            </li>
          ))}</ul>
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
