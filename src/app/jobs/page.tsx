import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { contains } from "@/lib/search";
import { MapPin, Briefcase } from "lucide-react";
import { formatDollars } from "@/lib/money";
import { Pagination, parsePage } from "@/components/Pagination";

const PAGE_SIZE = 25;

export const metadata = { title: "Browse Welding Jobs" };
export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: { searchParams: { city?: string; cat?: string; page?: string } }) {
  const city = searchParams.city?.trim() || "";
  const cat = searchParams.cat?.trim() || "";

  const where = {
    status: "OPEN",
    AND: [city ? { city: contains(city) } : {}, cat ? { category: cat } : {}],
  };

  // The board returned every open job in one response; it now pages like
  // the shop and the directory.
  const total = await prisma.job.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = parsePage(searchParams.page, pageCount);

  const jobs = await prisma.job.findMany({
    where,
    include: { customer: true, _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Open welding jobs</h1>
          <p className="text-slate-600">
            Browse opportunities from project owners across the network.
            {total > 0 && <span className="text-slate-500"> {total.toLocaleString()} open now.</span>}
          </p>
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
            <Link key={j.id} href={`/jobs/${j.id}`} className="card flex items-start justify-between gap-4 transition hover:border-brand/40">
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
              {j.budget && <div className="text-right"><div className="font-bold text-slate-900">{formatDollars(j.budget)}</div><div className="text-xs text-slate-500">budget</div></div>}
            </Link>
          ))}
          <Pagination page={page} pageCount={pageCount} basePath="/jobs" params={{ city, cat }} />
        </div>
      )}
    </div>
  );
}
