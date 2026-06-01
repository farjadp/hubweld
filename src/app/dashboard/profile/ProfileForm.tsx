"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = { bio: string; skills: string; certifications: string; serviceArea: string; hourlyRate: number | null; yearsExp: number | null };

export default function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initial,
    hourlyRate: initial.hourlyRate?.toString() ?? "",
    yearsExp: initial.yearsExp?.toString() ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const res = await fetch("/api/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: form.bio, skills: form.skills, certifications: form.certifications, serviceArea: form.serviceArea,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        yearsExp: form.yearsExp ? Number(form.yearsExp) : null,
      }),
    });
    setLoading(false);
    setMsg(res.ok ? "Saved." : "Failed to save.");
    if (res.ok) router.refresh();
  }
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div><label className="label">Bio</label><textarea className="input min-h-32" value={form.bio} onChange={(e) => set("bio", e.target.value)} /></div>
      <div><label className="label">Skills (comma separated)</label><input className="input" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="TIG, MIG, Stainless, Aluminum, Pipe" /></div>
      <div><label className="label">Certifications</label><input className="input" value={form.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="AWS D1.1, CWB" /></div>
      <div><label className="label">Service area</label><input className="input" value={form.serviceArea} onChange={(e) => set("serviceArea", e.target.value)} placeholder="Toronto, GTA" /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label">Hourly rate (USD)</label><input className="input" type="number" min={0} value={form.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} /></div>
        <div><label className="label">Years of experience</label><input className="input" type="number" min={0} value={form.yearsExp} onChange={(e) => set("yearsExp", e.target.value)} /></div>
      </div>
      {msg && <p className="text-sm text-amber">{msg}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Saving..." : "Save profile"}</button>
    </form>
  );
}
