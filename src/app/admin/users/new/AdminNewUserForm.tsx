"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const ROLES = ["CUSTOMER", "WELDER", "SUPPLIER", "ADMIN"] as const;

export default function AdminNewUserForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", role: "CUSTOMER" as string, businessName: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to create user"); return; }
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label">Full name</label><input className="input" required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 6 characters" />
        </div>
        <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Toronto" /></div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {form.role === "SUPPLIER" && (
          <div><label className="label">Business name</label><input className="input" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required={form.role === "SUPPLIER"} /></div>
        )}
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={() => router.push("/admin/users")} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Creating..." : "Create user"}</button>
      </div>
    </form>
  );
}
