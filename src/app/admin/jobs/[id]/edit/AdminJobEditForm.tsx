"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["mobile", "fabrication", "repair", "structural", "other"] as const;
const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

type Initial = {
  title: string; description: string; city: string;
  category: string; budget: number; status: string;
};

export default function AdminJobEditForm({ jobId, initial }: { jobId: string; initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set<K extends keyof Initial>(k: K, v: Initial[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setSuccess(false);
    const res = await fetch(`/api/admin/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: form.budget || null }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to save"); return; }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-28" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Budget ($)</label>
          <input className="input" type="number" min="0" value={form.budget} onChange={(e) => set("budget", Number(e.target.value))} placeholder="0 = no budget" />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {err && <p className="text-sm text-brand">{err}</p>}
      {success && <p className="text-sm text-green-700">Saved successfully!</p>}
      <div className="flex gap-3">
        <button type="button" onClick={() => router.push("/admin/jobs")} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
