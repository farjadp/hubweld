"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, Package, ExternalLink } from "lucide-react";

type Profile = {
  id: string; businessName: string; description: string; website: string;
  approved: boolean; userName: string; userEmail: string; products: number;
};

export default function SupplierRow({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    await fetch(`/api/admin/suppliers/${profile.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved: !profile.approved }) });
    setBusy(false);
    router.refresh();
  }
  return (
    <li className={`flex flex-wrap items-start justify-between gap-4 rounded-xl border px-5 py-4 transition-colors ${profile.approved ? "border-white/10 bg-[#111315]" : "border-amber-600/25 bg-amber-600/5"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-white">{profile.businessName}</span>
          {profile.approved
            ? <span className="inline-flex items-center gap-1 rounded border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-400"><ShieldCheck size={9} /> Verified</span>
            : <span className="inline-flex items-center rounded border border-amber-600/30 bg-amber-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-400">Pending</span>
          }
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-white/40">
          <span>{profile.userName} · {profile.userEmail}</span>
          <span className="inline-flex items-center gap-1"><Package size={10} /> {profile.products} products</span>
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white/70 transition-colors">
              <ExternalLink size={10} /> {profile.website}
            </a>
          )}
        </div>
        {profile.description && <p className="mt-1.5 text-xs leading-relaxed text-white/50 line-clamp-2">{profile.description}</p>}
      </div>
      <button
        disabled={busy}
        onClick={toggle}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-50 transition-colors ${
          profile.approved
            ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            : "border-green-600/30 bg-green-600/10 text-green-400 hover:bg-green-600/20"
        }`}
      >
        {busy ? "…" : profile.approved ? <><ShieldOff size={12} /> Revoke</> : <><ShieldCheck size={12} /> Approve</>}
      </button>
    </li>
  );
}
