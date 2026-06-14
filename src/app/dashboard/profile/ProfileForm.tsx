"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X, FileText, ImagePlus, User } from "lucide-react";
import MultiSelect from "./MultiSelect";
import { COUNTRIES, LANGUAGES } from "@/lib/locations";

type Initial = {
  bio: string; skills: string; certifications: string; serviceArea: string;
  hourlyRate: number | null; yearsExp: number | null;
  avatarUrl: string; resumeUrl: string; gallery: string[];
  languages: string[]; country: string; serviceCountries: string[];
};

const MAX_GALLERY = 12;

export default function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    bio: initial.bio, skills: initial.skills, certifications: initial.certifications,
    serviceArea: initial.serviceArea,
    hourlyRate: initial.hourlyRate?.toString() ?? "",
    yearsExp: initial.yearsExp?.toString() ?? "",
    avatarUrl: initial.avatarUrl,
    resumeUrl: initial.resumeUrl,
    gallery: initial.gallery,
    languages: initial.languages,
    country: initial.country,
    serviceCountries: initial.serviceCountries,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function uploadFile(file: File, kind: "avatar" | "resume" | "gallery"): Promise<string | null> {
    setErr(null);
    setUploading(kind);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const res = await fetch("/api/profile/upload", { method: "POST", body: fd });
    setUploading(null);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Upload failed."); return null; }
    const { url } = await res.json();
    return url;
  }

  async function onAvatar(file: File) {
    const url = await uploadFile(file, "avatar");
    if (url) set("avatarUrl", url);
  }
  async function onResume(file: File) {
    const url = await uploadFile(file, "resume");
    if (url) set("resumeUrl", url);
  }
  async function onGallery(files: FileList) {
    const remaining = MAX_GALLERY - form.gallery.length;
    if (remaining <= 0) { setErr(`Gallery limit is ${MAX_GALLERY} images.`); return; }
    const toUpload = Array.from(files).slice(0, remaining);
    const urls: string[] = [];
    for (const f of toUpload) {
      const url = await uploadFile(f, "gallery");
      if (url) urls.push(url);
    }
    if (urls.length) setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null); setErr(null);
    const res = await fetch("/api/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: form.bio, skills: form.skills, certifications: form.certifications, serviceArea: form.serviceArea,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        yearsExp: form.yearsExp ? Number(form.yearsExp) : null,
        avatarUrl: form.avatarUrl,
        resumeUrl: form.resumeUrl,
        galleryJson: JSON.stringify(form.gallery),
        languages: form.languages.join(", "),
        country: form.country,
        serviceCountries: form.serviceCountries.join(", "),
      }),
    });
    setLoading(false);
    if (res.ok) { setMsg("Profile saved."); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to save."); }
  }

  return (
    <form onSubmit={submit} className="card space-y-6">
      {/* Avatar */}
      <div>
        <label className="label">Profile photo</label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
            {form.avatarUrl
              ? <img src={form.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              : <User size={28} className="text-white/30" />}
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => avatarRef.current?.click()} disabled={uploading === "avatar"}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 disabled:opacity-50">
              {uploading === "avatar" ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload photo
            </button>
            {form.avatarUrl && (
              <button type="button" onClick={() => set("avatarUrl", "")} className="text-xs text-red-400 hover:underline">Remove</button>
            )}
            <span className="text-[11px] text-white/30">JPG, PNG, WebP · max 5MB</span>
          </div>
          <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onAvatar(f); e.target.value = ""; }} />
        </div>
      </div>

      <div><label className="label">Bio</label><textarea className="input min-h-32" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Describe your experience, specialties, and what makes your work stand out." /></div>
      <div><label className="label">Skills (comma separated)</label><input className="input" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="TIG, MIG, Stainless, Aluminum, Pipe" /></div>
      <div><label className="label">Certifications</label><input className="input" value={form.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="AWS D1.1, CWB" /></div>

      {/* Languages */}
      <div>
        <label className="label">Languages spoken</label>
        <MultiSelect options={LANGUAGES} selected={form.languages} onChange={(v) => set("languages", v)} placeholder="Select one or more languages" />
      </div>

      {/* Residence country */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Country of residence</label>
          <select className="input" value={form.country} onChange={(e) => set("country", e.target.value)}>
            <option value="">Select country...</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Local service area</label>
          <input className="input" value={form.serviceArea} onChange={(e) => set("serviceArea", e.target.value)} placeholder="Toronto, GTA" />
        </div>
      </div>

      {/* Service countries */}
      <div>
        <label className="label">Countries you can serve</label>
        <MultiSelect options={COUNTRIES} selected={form.serviceCountries} onChange={(v) => set("serviceCountries", v)} placeholder="Select countries you offer services in" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label">Hourly rate (USD)</label><input className="input" type="number" min={0} value={form.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} /></div>
        <div>
          <label className="label">Years of experience</label>
          <select className="input" value={form.yearsExp} onChange={(e) => set("yearsExp", e.target.value)}>
            <option value="">Select...</option>
            {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "year" : "years"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resume */}
      <div>
        <label className="label">Resume / CV</label>
        {form.resumeUrl ? (
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <a href={form.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-red-400">
              <FileText size={16} /> View uploaded resume
            </a>
            <button type="button" onClick={() => set("resumeUrl", "")} className="text-xs text-red-400 hover:underline">Remove</button>
          </div>
        ) : (
          <button type="button" onClick={() => resumeRef.current?.click()} disabled={uploading === "resume"}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-sm text-white/50 hover:bg-white/10 disabled:opacity-50">
            {uploading === "resume" ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload resume (PDF or Word · max 10MB)
          </button>
        )}
        <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onResume(f); e.target.value = ""; }} />
      </div>

      {/* Gallery */}
      <div>
        <label className="label">Project gallery ({form.gallery.length}/{MAX_GALLERY})</label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {form.gallery.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img src={url} alt="project" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, gallery: f.gallery.filter((g) => g !== url) }))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600">
                <X size={13} />
              </button>
            </div>
          ))}
          {form.gallery.length < MAX_GALLERY && (
            <button type="button" onClick={() => galleryRef.current?.click()} disabled={uploading === "gallery"}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-50">
              {uploading === "gallery" ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
              <span className="text-[10px]">Add photo</span>
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-white/30">JPG, PNG, WebP · max 5MB each · up to {MAX_GALLERY} photos.</p>
        <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => { const fs = e.target.files; if (fs && fs.length) onGallery(fs); e.target.value = ""; }} />
      </div>

      {err && <p className="text-sm text-red-400">{err}</p>}
      {msg && <p className="text-sm text-green-400">{msg}</p>}
      <button className="btn-primary w-full" disabled={loading || !!uploading}>{loading ? "Saving..." : "Save profile"}</button>
    </form>
  );
}
