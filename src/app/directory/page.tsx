import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, BadgeCheck, Wrench } from "lucide-react";

export const metadata = { title: "Find Certified Welders & Fabrication Shops" };
export const dynamic = "force-dynamic";

export default async function DirectoryPage({ searchParams }: { searchParams: { q?: string; city?: string } }) {
  const q = searchParams.q?.trim() || "";
  const city = searchParams.city?.trim() || "";
  const welders = await prisma.user.findMany({
    where: {
      role: "WELDER",
      banned: false,
      AND: [
        q ? { OR: [{ name: { contains: q } }, { welderProfile: { skills: { contains: q } } }, { welderProfile: { certifications: { contains: q } } }] } : {},
        city ? { OR: [{ city: { contains: city } }, { welderProfile: { serviceArea: { contains: city } } }] } : {},
      ],
    },
    include: { welderProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Certified welders & fabrication shops</h1>
          <p className="text-white/60">Search vetted welding professionals by skill or location.</p>
        </div>
      </div>

      <form className="card mb-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input className="input" name="q" defaultValue={q} placeholder="Skill or certification (TIG, MIG, AWS, CWB...)" />
        <input className="input" name="city" defaultValue={city} placeholder="City or service area" />
        <button className="btn-primary">Search</button>
      </form>

      {welders.length === 0 ? (
        <p className="text-white/60">No welders match your filters yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {welders.map((w) => (
            <Link key={w.id} href={`/welders/${w.id}`} className="card transition hover:border-amber/40">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold">{w.name}</h3>
                {w.welderProfile?.approved && <span className="badge bg-emerald-300/20 text-emerald-200"><BadgeCheck size={14} /> Verified</span>}
              </div>
              <p className="mb-3 text-sm text-white/70 line-clamp-3">{w.welderProfile?.bio || "Welding professional on HubWeld."}</p>
              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                {(w.welderProfile?.skills || "").split(",").filter(Boolean).slice(0, 5).map((s) => (
                  <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"><Wrench size={12} className="mr-1 inline" />{s.trim()}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/60"><MapPin size={14} /> {w.welderProfile?.serviceArea || w.city || "—"}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
