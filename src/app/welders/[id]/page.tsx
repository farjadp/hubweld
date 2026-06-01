import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WelderPage({ params }: { params: { id: string } }) {
  const welder = await prisma.user.findFirst({
    where: { id: params.id, role: "WELDER", banned: false },
    include: { welderProfile: true, receivedReviews: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!welder) notFound();
  const p = welder.welderProfile;
  const avg = welder.receivedReviews.length ? (welder.receivedReviews.reduce((a, r) => a + r.rating, 0) / welder.receivedReviews.length).toFixed(1) : null;
  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="card">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">{welder.name}</h1>
          {p?.approved && <span className="badge bg-emerald-300/20 text-emerald-200"><BadgeCheck size={14} /> Verified</span>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-white/60"><MapPin size={14} /> {p?.serviceArea || welder.city || "—"}</div>
        {avg && <div className="mt-2 text-amber">★ {avg} ({welder.receivedReviews.length} reviews)</div>}
        <p className="mt-4 whitespace-pre-line text-white/80">{p?.bio || "—"}</p>
        <h3 className="mt-6 mb-2 font-bold">Reviews</h3>
        {welder.receivedReviews.length === 0 ? <p className="text-white/60">No reviews yet.</p> : (
          <ul className="space-y-3">
            {welder.receivedReviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-amber">{"★".repeat(r.rating)}<span className="text-white/30">{"★".repeat(5 - r.rating)}</span></div>
                <div className="text-sm text-white/80">{r.comment}</div>
                <div className="mt-1 text-xs text-white/50">— {r.author.name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="card h-fit">
        <h3 className="mb-2 font-bold">Skills</h3>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">{(p?.skills || "").split(",").filter(Boolean).map((s) => <span key={s} className="rounded-full bg-white/5 px-2 py-1">{s.trim()}</span>)}</div>
        <h3 className="mb-2 font-bold">Certifications</h3>
        <p className="text-sm text-white/70">{p?.certifications || "—"}</p>
        <h3 className="mt-4 mb-2 font-bold">Experience</h3>
        <p className="text-sm text-white/70">{p?.yearsExp ? `${p.yearsExp} years` : "—"}</p>
        {p?.hourlyRate && <p className="mt-2 text-sm text-white/70">Rate: ${p.hourlyRate}/hr</p>}
      </aside>
    </div>
  );
}
