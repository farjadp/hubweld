"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  return <Suspense fallback={<div className="mx-auto max-w-md py-12 text-slate-600">Loading…</div>}><RegisterInner /></Suspense>;
}

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (() => { const r = params.get("role"); return r === "WELDER" || r === "SUPPLIER" ? r : "CUSTOMER"; })();
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", role: initialRole, businessName: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const data = await res.json().catch(() => ({})); setErr(data.error || "Failed to register"); setLoading(false); return; }
    const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (signInRes?.error) { setErr("Account created but sign-in failed. Please log in manually."); return; }
    router.push("/dashboard");
  }

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-2 text-3xl font-black tracking-tight">Create your HubWeld account</h1>
      <p className="mb-6 text-slate-600">Choose how you want to use HubWeld.</p>
      <form onSubmit={submit} className="card space-y-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {(["CUSTOMER", "WELDER", "SUPPLIER"] as const).map((r) => (
            <button key={r} type="button" onClick={() => set("role", r)}
              className={`rounded-xl border p-3 text-left text-sm transition ${form.role === r ? "border-amber/60 bg-amber/10" : "border-slate-200 bg-slate-100 hover:bg-slate-100"}`}>
              <div className="font-bold">{r === "CUSTOMER" ? "I need welding work" : r === "WELDER" ? "I provide welding services" : "I sell welding supplies"}</div>
              <div className="text-slate-600">{r === "CUSTOMER" ? "Post jobs, receive bids" : r === "WELDER" ? "Get matched to jobs" : "List products on the marketplace"}</div>
            </button>
          ))}
        </div>
        <div><label className="label">{form.role === "SUPPLIER" ? "Contact name" : "Full name"}</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
        {form.role === "SUPPLIER" && (
          <div><label className="label">Business name</label><input className="input" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required={form.role === "SUPPLIER"} placeholder="e.g. NorthArc Supply Co." /></div>
        )}
        <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
        <div><label className="label">Password</label><input className="input" type="password" minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} required /></div>
        <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Toronto" /></div>
        {err && <p className="text-sm text-brand">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        <p className="text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="text-amber hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
}
