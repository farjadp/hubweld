"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldOff, Ban, CheckCircle2, Trash2, Pencil } from "lucide-react";

type U = { id: string; name: string | null; email: string | null; role: string; banned: boolean; approved: boolean | null };

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-600/20 text-brand border-red-600/30",
  WELDER: "bg-blue-600/20 text-blue-700 border-blue-600/30",
  SUPPLIER: "bg-amber-600/20 text-amber-700 border-amber-600/30",
  CUSTOMER: "bg-slate-100 text-slate-500 border-slate-200",
};

const ROLES = ["CUSTOMER", "WELDER", "SUPPLIER", "ADMIN"] as const;

export default function UserRow({ user }: { user: U }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showRole, setShowRole] = useState(false);

  async function call(action: string, extra?: object) {
    setBusy(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setBusy(false);
    router.refresh();
  }

  async function del() {
    if (!confirm(`Delete user "${user.name ?? user.email}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  const initials = (user.name ?? user.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className={`rounded-xl border px-5 py-4 transition-colors ${user.banned ? "border-red-900/40 bg-red-950/20" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Info */}
        <div className="flex items-center gap-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-700">{initials}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900">{user.name ?? "—"}</span>
              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${roleBadge[user.role] ?? roleBadge.CUSTOMER}`}>{user.role}</span>
              {user.banned && <span className="inline-flex items-center rounded border border-red-600/40 bg-red-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand">Banned</span>}
              {user.role === "WELDER" && user.approved && <span className="inline-flex items-center gap-1 rounded border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-700"><CheckCircle2 size={9} /> Verified</span>}
              {user.role === "WELDER" && !user.approved && <span className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Unverified</span>}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{user.email}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit */}
          <Link href={`/admin/users/${user.id}/edit`} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            <Pencil size={12} /> Edit
          </Link>

          {/* Change Role */}
          <div className="relative">
            <button disabled={busy} onClick={() => setShowRole((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
              Role ▾
            </button>
            {showRole && (
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-xl border border-slate-200 bg-slate-50 shadow-xl">
                {ROLES.map((r) => (
                  <button key={r} onClick={() => { setShowRole(false); call("changeRole", { role: r }); }}
                    className={`w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-100 transition-colors ${user.role === r ? "text-amber-700" : "text-slate-600"}`}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Verify / Un-verify */}
          {user.role === "WELDER" && !user.approved && (
            <button disabled={busy} onClick={() => call("approveWelder")} className="flex items-center gap-1.5 rounded-lg border border-green-600/30 bg-green-600/10 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-600/20 disabled:opacity-50 transition-colors">
              <ShieldCheck size={13} /> Verify
            </button>
          )}
          {user.role === "WELDER" && user.approved && (
            <button disabled={busy} onClick={() => call("unapproveWelder")} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
              <ShieldOff size={13} /> Un-verify
            </button>
          )}

          {/* Ban / Unban */}
          {!user.banned ? (
            <button disabled={busy} onClick={() => call("ban")} className="flex items-center gap-1.5 rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-red-600/20 disabled:opacity-50 transition-colors">
              <Ban size={13} /> Ban
            </button>
          ) : (
            <button disabled={busy} onClick={() => call("unban")} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
              <CheckCircle2 size={13} /> Unban
            </button>
          )}

          {/* Delete */}
          <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-900/30 disabled:opacity-50 transition-colors">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
