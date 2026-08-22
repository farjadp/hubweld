import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { contains } from "@/lib/search";
import { MapPin, Briefcase } from "lucide-react";
import { formatDollars } from "@/lib/money";

export const metadata = { title: "Browse Welding Jobs" };
export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: { searchParams: { city?: string; cat?: string } }) {
  const city = searchParams.city?.trim() || "";
  const cat = searchParams.cat?.trim() || "";
  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      AND: [city ? { city: contains(city) } : {}, cat ? { category: cat } : {}],
    },
    include: { customer: true, _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Open welding jobs</h1>
          <p className="text-slate-600">Browse opportunities from project owners across the network.</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">Post a Job</Link>
      </div>
      <form className="card mb-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input className="input" name="city" defaultValue={city} placeholder="City" />
        <select className="input" name="cat" defaultValue={cat}>
          <option value="">Any category</option>
          <option value="mobile">Mobile welding</option>
          <option value="fabrication">Fabrication</option>
          <option value="repair">Repair</option>
          <option value="structural">Structural</option>
          <option value="other">Other</option>
        </select>
        <button className="btn-primary">Filter</button>
      </form>
      {jobs.length === 0 ? <p className="text-slate-600">No open jobs match.</p> : (
        <div className="grid gap-4">
          {jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} className="card flex items-start justify-between gap-4 transition hover:border-amber/40">
              <div>
                <h3 className="text-lg font-bold">{j.title}</h3>
                <p className="mt-1 text-sm text-slate-700 line-clamp-2">{j.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {j.city}</span>
                  <span className="inline-flex items-center gap-1"><Briefcase size={12} /> {j.category}</span>
                  <span>by {j.customer.name}</span>
                  <span>{j._count.bids} bids</span>
                </div>
              </div>
              {j.budget && <div className="text-right"><div className="text-amber font-bold">{formatDollars(j.budget)}</div><div className="text-xs text-slate-500">budget</div></div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
