"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, ShieldOff, Ban, CheckCircle2 } from "lucide-react";

type U = { id: string; name: string | null; email: string | null; role: string; banned: boolean; approved: boolean | null };

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-600/20 text-red-400 border-red-600/30",
  WELDER: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  SUPPLIER: "bg-amber-600/20 text-amber-400 border-amber-600/30",
  CUSTOMER: "bg-white/10 text-white/50 border-white/10",
};

export default function UserRow({ user }: { user: U }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function call(action: string) {
    setBusy(true);
    await fetch(`/api/admin/users/${user.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setBusy(false);
    router.refresh();
  }
  const initials = (user.name ?? user.email ?? "?").slice(0, 2).toUpperCase();
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-colors ${user.banned ? "border-red-900/40 bg-red-950/20" : "border-white/10 bg-[#111315] hover:border-white/20"}`}>
      <div className="flex items-center gap-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-sm font-black text-white/70">{initials}</div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white">{user.name ?? "—"}</span>
            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${roleBadge[user.role] ?? roleBadge.CUSTOMER}`}>{user.role}</span>
            {user.banned && <span className="inline-flex items-center rounded border border-red-600/40 bg-red-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">Banned</span>}
            {user.role === "WELDER" && user.approved && <span className="inline-flex items-center gap-1 rounded border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-400"><CheckCircle2 size={9} /> Verified</span>}
            {user.role === "WELDER" && !user.approved && <span className="inline-flex items-center rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/30">Unverified</span>}
          </div>
          <div className="mt-0.5 text-xs text-white/40">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {user.role === "WELDER" && !user.approved && (
          <button disabled={busy} onClick={() => call("approveWelder")} className="flex items-center gap-1.5 rounded-lg border border-green-600/30 bg-green-600/10 px-3 py-1.5 text-xs font-bold text-green-400 hover:bg-green-600/20 disabled:opacity-50 transition-colors">
            <ShieldCheck size={13} /> Verify
          </button>
        )}
        {user.role === "WELDER" && user.approved && (
          <button disabled={busy} onClick={() => call("unapproveWelder")} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-50 transition-colors">
            <ShieldOff size={13} /> Un-verify
          </button>
        )}
        {!user.banned ? (
          <button disabled={busy} onClick={() => call("ban")} className="flex items-center gap-1.5 rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-600/20 disabled:opacity-50 transition-colors">
            <Ban size={13} /> Ban
          </button>
        ) : (
          <button disabled={busy} onClick={() => call("unban")} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-50 transition-colors">
            <CheckCircle2 size={13} /> Unban
          </button>
        )}
      </div>
    </div>
  );
}
