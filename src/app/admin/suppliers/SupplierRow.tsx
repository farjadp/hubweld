"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, Package, ExternalLink, Pencil, Trash2, X, Check } from "lucide-react";

type Profile = {
  id: string; businessName: string; description: string; website: string;
  approved: boolean; userName: string; userEmail: string; products: number;
};

export default function SupplierRow({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: profile.businessName,
    description: profile.description ?? "",
    website: profile.website ?? "",
  });

  async function patch(data: object) {
    setBusy(true);
    await fetch(`/api/admin/suppliers/${profile.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    setBusy(false);
    router.refresh();
  }

  async function saveEdit() {
    await patch(editForm);
    setEditing(false);
  }

  async function del() {
    if (!confirm(`Delete supplier "${profile.businessName}" and their account? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/admin/suppliers/${profile.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <li className={`rounded-xl border px-5 py-4 transition-colors ${profile.approved ? "border-slate-200 bg-white" : "border-amber-600/25 bg-amber-600/5"}`}>
      {!editing ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900">{profile.businessName}</span>
              {profile.approved
                ? <span className="inline-flex items-center gap-1 rounded border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-700"><ShieldCheck size={9} /> Verified</span>
                : <span className="inline-flex items-center rounded border border-amber-600/30 bg-amber-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700">Pending</span>
              }
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{profile.userName} · {profile.userEmail}</span>
              <span className="inline-flex items-center gap-1"><Package size={10} /> {profile.products} products</span>
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors">
                  <ExternalLink size={10} /> {profile.website}
                </a>
              )}
            </div>
            {profile.description && <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">{profile.description}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {/* Edit */}
            <button disabled={busy} onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
              <Pencil size={12} /> Edit
            </button>
            {/* Approve / Revoke */}
            <button disabled={busy} onClick={() => patch({ approved: !profile.approved })}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-50 transition-colors ${
                profile.approved ? "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100" : "border-green-600/30 bg-green-600/10 text-green-700 hover:bg-green-600/20"
              }`}>
              {busy ? "…" : profile.approved ? <><ShieldOff size={12} /> Revoke</> : <><ShieldCheck size={12} /> Approve</>}
            </button>
            {/* Delete */}
            <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-900/30 disabled:opacity-50 transition-colors">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div><label className="label">Business name</label><input className="input" value={editForm.businessName} onChange={(e) => setEditForm((f) => ({ ...f, businessName: e.target.value }))} /></div>
            <div><label className="label">Website</label><input className="input" value={editForm.website} onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://..." /></div>
            <div className="md:col-span-2"><label className="label">Description</label><textarea className="input min-h-16" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-1.5 text-xs"><X size={13} /> Cancel</button>
            <button disabled={busy} onClick={saveEdit} className="btn-primary flex items-center gap-1.5 text-xs"><Check size={13} /> {busy ? "Saving…" : "Save"}</button>
          </div>
        </div>
      )}
    </li>
  );
}
