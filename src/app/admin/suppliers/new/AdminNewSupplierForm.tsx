"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNewSupplierForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", city: "", businessName: "", description: "", website: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);

    // 1. Register the user as SUPPLIER
    const regRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, email: form.email, password: form.password,
        city: form.city, role: "SUPPLIER", businessName: form.businessName,
      }),
    });
    if (!regRes.ok) {
      const d = await regRes.json().catch(() => ({}));
      setErr(d.error || "Failed to create supplier account");
      setLoading(false); return;
    }
    const { id: userId } = await regRes.json();

    // 2. Update the supplier profile with description/website if provided
    if (form.description || form.website) {
      const profile = await fetch(`/api/admin/suppliers/by-user/${userId}`, {
        method: "GET",
      }).then((r) => r.json()).catch(() => null);

      if (profile?.id) {
        await fetch(`/api/admin/suppliers/${profile.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: form.description, website: form.website }),
        });
      }
    }

    setLoading(false);
    router.push("/admin/suppliers");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="mb-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
        This will create a new user account with <strong className="text-white/80">SUPPLIER</strong> role.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label">Contact name</label><input className="input" required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="label">Business name</label><input className="input" required minLength={2} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="e.g. NorthArc Supply Co." /></div>
        <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><label className="label">Password</label><input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 6 characters" /></div>
        <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Toronto" /></div>
        <div><label className="label">Website <span className="text-white/30">optional</span></label><input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." /></div>
        <div className="md:col-span-2"><label className="label">Description <span className="text-white/30">optional</span></label>
          <textarea className="input min-h-20" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description of products/services..." />
        </div>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={() => router.push("/admin/suppliers")} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Creating..." : "Create supplier"}
        </button>
      </div>
    </form>
  );
}
