import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, FileText, Globe, Languages as LanguagesIcon, User } from "lucide-react";

export const dynamic = "force-dynamic";

function splitList(s?: string | null): string[] {
  return (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}
function parseGallery(json?: string | null): string[] {
  if (!json) return [];
  try { const a = JSON.parse(json); return Array.isArray(a) ? a.filter((x) => typeof x === "string") : []; }
  catch { return []; }
}

export default async function WelderPage({ params }: { params: { id: string } }) {
  const welder = await prisma.user.findFirst({
    where: { id: params.id, role: "WELDER", banned: false },
    include: { welderProfile: true, receivedReviews: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!welder) notFound();
  const p = welder.welderProfile;
  const avg = welder.receivedReviews.length ? (welder.receivedReviews.reduce((a, r) => a + r.rating, 0) / welder.receivedReviews.length).toFixed(1) : null;
  const languages = splitList(p?.languages);
  const serviceCountries = splitList(p?.serviceCountries);
  const gallery = parseGallery(p?.galleryJson);

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {p?.avatarUrl
              ? <img src={p.avatarUrl} alt={welder.name} className="h-full w-full object-cover" />
              : <User size={26} className="text-slate-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight">{welder.name}</h1>
              {p?.approved && <span className="badge bg-emerald-300/20 text-emerald-200"><BadgeCheck size={14} /> Verified</span>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {p?.serviceArea || welder.city || "—"}{p?.country ? `, ${p.country}` : ""}</span>
              {avg && <span className="text-amber-700">★ {avg} ({welder.receivedReviews.length})</span>}
            </div>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-line text-slate-700">{p?.bio || "—"}</p>

        {/* Project gallery */}
        {gallery.length > 0 && (
          <>
            <h3 className="mt-6 mb-3 font-bold">Project Gallery</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img src={url} alt="project" className="h-full w-full object-cover transition-transform hover:scale-105" />
                </a>
              ))}
            </div>
          </>
        )}

        <h3 className="mt-6 mb-2 font-bold">Reviews</h3>
        {welder.receivedReviews.length === 0 ? <p className="text-slate-600">No reviews yet.</p> : (
          <ul className="space-y-3">
            {welder.receivedReviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-200 bg-slate-100 p-3">
                <div className="text-amber-700">{"★".repeat(r.rating)}<span className="text-slate-400">{"★".repeat(5 - r.rating)}</span></div>
                <div className="text-sm text-slate-700">{r.comment}</div>
                <div className="mt-1 text-xs text-slate-500">— {r.author.name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="card h-fit space-y-4">
        <div>
          <h3 className="mb-2 font-bold">Skills</h3>
          <div className="flex flex-wrap gap-2 text-xs">{splitList(p?.skills).map((s) => <span key={s} className="rounded-full bg-slate-100 px-2 py-1">{s}</span>)}</div>
        </div>

        <div>
          <h3 className="mb-2 font-bold">Certifications</h3>
          <p className="text-sm text-slate-700">{p?.certifications || "—"}</p>
        </div>

        {languages.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 font-bold"><LanguagesIcon size={15} /> Languages</h3>
            <div className="flex flex-wrap gap-2 text-xs">{languages.map((l) => <span key={l} className="rounded-full bg-slate-100 px-2 py-1">{l}</span>)}</div>
          </div>
        )}

        {serviceCountries.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 font-bold"><Globe size={15} /> Serves in</h3>
            <div className="flex flex-wrap gap-2 text-xs">{serviceCountries.map((c) => <span key={c} className="rounded-full bg-slate-100 px-2 py-1">{c}</span>)}</div>
          </div>
        )}

        <div>
          <h3 className="mb-1 font-bold">Experience</h3>
          <p className="text-sm text-slate-700">{p?.yearsExp ? `${p.yearsExp} years` : "—"}</p>
          {p?.hourlyRate && <p className="mt-1 text-sm text-slate-700">Rate: ${p.hourlyRate}/hr</p>}
        </div>

        {p?.resumeUrl && (
          <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex w-full items-center justify-center gap-2">
            <FileText size={15} /> View Resume
          </a>
        )}
      </aside>
    </div>
  );
}
