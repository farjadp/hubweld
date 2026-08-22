"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate, errorMessage } from "@/lib/api";

type Props = {
  role: string;
  email: string;
  name: string;
  city: string;
  phone: string;
  supplier?: { businessName: string; description: string; website: string } | null;
};

export default function AccountForm({ role, email, name, city, phone, supplier }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name,
    city,
    phone,
    businessName: supplier?.businessName ?? "",
    description: supplier?.description ?? "",
    website: supplier?.website ?? "",
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setDone("");

    if (pw.newPassword && pw.newPassword !== pw.confirm) {
      setErr("The two new passwords do not match");
      return;
    }

    setBusy(true);
    try {
      await mutate("/api/account", {
        method: "PATCH",
        body: {
          name: form.name,
          city: form.city,
          phone: form.phone,
          ...(role === "SUPPLIER"
            ? { businessName: form.businessName, description: form.description, website: form.website }
            : {}),
          ...(pw.newPassword
            ? { currentPassword: pw.currentPassword, newPassword: pw.newPassword }
            : {}),
        },
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setDone(pw.newPassword ? "Saved. Your password has been changed." : "Saved.");
      router.refresh();
    } catch (e2) {
      setErr(errorMessage(e2, "Could not save your changes"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="card space-y-6">
      <div>
        <label className="label">Email</label>
        <input className="input bg-slate-50 text-slate-500" value={email} disabled />
        <p className="mt-1 text-xs text-slate-500">Contact an admin to change the email on your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">City</label>
        <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
      </div>

      {role === "SUPPLIER" && (
        <div className="space-y-4 border-t border-slate-200 pt-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">Storefront</h2>
          <div>
            <label className="label">Business name</label>
            <input className="input" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px]"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What you supply, which brands you carry, who you serve."
            />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
          </div>
          <p className="text-xs text-slate-500">
            The Verified badge is granted by an admin and is not changed here.
          </p>
        </div>
      )}

      <div className="space-y-4 border-t border-slate-200 pt-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide">Change password</h2>
        <p className="text-xs text-slate-500">Leave these blank to keep your current password.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Current</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={pw.currentPassword}
              onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">New</label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={pw.newPassword}
              onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Confirm new</label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {err && <p className="rounded-sm border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-brand">{err}</p>}
      {done && <p className="rounded-sm border border-green-600/30 bg-green-50 px-3 py-2 text-sm text-green-700">{done}</p>}

      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
