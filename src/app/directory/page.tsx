import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { contains } from "@/lib/search";
import { MapPin, BadgeCheck, Wrench, Star } from "lucide-react";

export const metadata = { title: "Find Certified Welders & Fabrication Shops" };
export const dynamic = "force-dynamic";

export default async function DirectoryPage({ searchParams }: { searchParams: { q?: string; city?: string; verified?: string } }) {
  const q = searchParams.q?.trim() || "";
  const city = searchParams.city?.trim() || "";
  const verifiedOnly = searchParams.verified === "1";

  const welders = await prisma.user.findMany({
    where: {
      role: "WELDER",
      banned: false,
      ...(verifiedOnly ? { welderProfile: { approved: true } } : {}),
      AND: [
        q ? { OR: [{ name: contains(q) }, { welderProfile: { skills: contains(q) } }, { welderProfile: { certifications: contains(q) } }] } : {},
        city ? { OR: [{ city: contains(city) }, { welderProfile: { serviceArea: contains(city) } }] } : {},
      ],
    },
    include: {
      welderProfile: true,
      receivedReviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Sort: verified first, then by avg rating desc
  const sorted = [...welders].sort((a, b) => {
    if (a.welderProfile?.approved && !b.welderProfile?.approved) return -1;
    if (!a.welderProfile?.approved && b.welderProfile?.approved) return 1;
    const avgA = a.receivedReviews.length ? a.receivedReviews.reduce((s, r) => s + r.rating, 0) / a.receivedReviews.length : 0;
    const avgB = b.receivedReviews.length ? b.receivedReviews.reduce((s, r) => s + r.rating, 0) / b.receivedReviews.length : 0;
    return avgB - avgA;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Certified welders & fabrication shops</h1>
          <p className="text-slate-600">Search vetted welding professionals by skill or location.</p>
        </div>
      </div>

      <form className="card mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input className="input" name="q" defaultValue={q} placeholder="Skill or certification (TIG, MIG, AWS, CWB...)" />
        <input className="input" name="city" defaultValue={city} placeholder="City or service area" />
        <button className="btn-primary">Search</button>
      </form>

      {/* Verified filter toggle */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={verifiedOnly ? `/directory${q || city ? `?q=${q}&city=${city}` : ""}` : `/directory?verified=1${q ? `&q=${q}` : ""}${city ? `&city=${city}` : ""}`}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${verifiedOnly ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300" : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-100"}`}
        >
          <BadgeCheck size={13} /> Verified only
        </Link>
        <span className="text-xs text-slate-400">{sorted.length} welder{sorted.length !== 1 ? "s" : ""} found</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-slate-600">No welders match your filters yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((w) => {
            const avg = w.receivedReviews.length
              ? (w.receivedReviews.reduce((s, r) => s + r.rating, 0) / w.receivedReviews.length).toFixed(1)
              : null;
            return (
              <Link key={w.id} href={`/welders/${w.id}`} className="card flex flex-col transition hover:border-slate-300">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{w.name}</h3>
                  {w.welderProfile?.approved && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                      <BadgeCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                <p className="mb-3 flex-1 text-sm text-slate-700 line-clamp-2">{w.welderProfile?.bio || "Welding professional on HubWeld."}</p>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 mb-3">
                  {(w.welderProfile?.skills || "").split(",").filter(Boolean).slice(0, 4).map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5">
                      <Wrench size={10} />{s.trim()}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {w.welderProfile?.serviceArea || w.city || "—"}</span>
                  {avg && (
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <Star size={13} className="fill-amber-400" /> {avg} <span className="font-normal text-slate-400">({w.receivedReviews.length})</span>
                    </span>
                  )}
                  {w.welderProfile?.hourlyRate && (
                    <span className="text-xs text-slate-500">${w.welderProfile.hourlyRate}/hr</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
