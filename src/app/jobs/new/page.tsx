"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", city: "", category: "mobile", budget: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const res = await fetch("/api/jobs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: form.budget ? Number(form.budget) : null }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to post job"); setLoading(false); return; }
    const data = await res.json();
    router.push(`/jobs/${data.id}`);
  }
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-2 text-3xl font-black tracking-tight">Post a welding job</h1>
      <p className="mb-6 text-slate-600">Share details. Welders will submit bids you can review and accept.</p>
      <form onSubmit={submit} className="card space-y-4">
        <div><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Stainless rail repair at food plant" /></div>
        <div><label className="label">Description</label><textarea className="input min-h-32" required value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Materials, certifications needed, timeline, site access..." /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">City</label><input className="input" required value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="mobile">Mobile welding</option><option value="fabrication">Fabrication</option><option value="repair">Repair</option><option value="structural">Structural</option><option value="other">Other</option>
            </select>
          </div>
        </div>
        <div><label className="label">Budget (USD, optional)</label><input className="input" type="number" min={0} value={form.budget} onChange={(e) => set("budget", e.target.value)} /></div>
        {err && <p className="text-sm text-brand">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Posting..." : "Post Job"}</button>
      </form>
    </div>
  );
}
