"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  return <Suspense fallback={<div className="mx-auto max-w-md py-12 text-slate-600">Loading…</div>}><LoginInner /></Suspense>;
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setErr("Invalid email or password");
    else router.push(params.get("callbackUrl") || "/dashboard");
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-2 text-3xl font-black tracking-tight">Welcome back</h1>
      <p className="mb-6 text-slate-600">Sign in to manage your jobs, bids, and profile.</p>
      <form onSubmit={submit} className="card space-y-4">
        <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {err && <p className="text-sm text-brand">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <p className="text-center text-sm text-slate-600">No account? <Link href="/register" className="text-amber hover:underline">Create one</Link></p>
      </form>
    </div>
  );
}
