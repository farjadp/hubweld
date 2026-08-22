"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["mobile", "fabrication", "repair", "structural", "other"] as const;
type Customer = { id: string; name: string | null; email: string };

export default function AdminNewJobForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", city: "", category: "fabrication" as string,
    budget: "", customerId: customers[0]?.id ?? "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const payload = {
      ...form,
      budget: form.budget ? parseInt(form.budget) : null,
    };
    const res = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to create job"); return; }
    router.push("/admin/jobs");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Job title</label>
          <input className="input" required minLength={3} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Pipeline TIG welding repair" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-28" required minLength={10} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the job requirements, materials, timeline..." />
        </div>
        <div>
          <label className="label">Customer (owner)</label>
          <select className="input" required value={form.customerId} onChange={(e) => set("customerId", e.target.value)}>
            <option value="">Select customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name ?? c.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" required minLength={2} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Toronto" />
        </div>
        <div>
          <label className="label">Budget ($) <span className="text-slate-400">optional</span></label>
          <input className="input" type="number" min="1" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. 2500" />
        </div>
      </div>
      {err && <p className="text-sm text-brand">{err}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={() => router.push("/admin/jobs")} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Creating..." : "Create job"}
        </button>
      </div>
    </form>
  );
}
