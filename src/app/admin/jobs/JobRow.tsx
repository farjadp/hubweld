"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";

const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export default function JobRow({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  async function setStatus(status: string) {
    setShowStatus(false);
    setBusy(true);
    await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {/* Edit */}
      <Link href={`/admin/jobs/${id}/edit`} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
        <Pencil size={12} /> Edit
      </Link>

      {/* Status */}
      <div className="relative">
        <button disabled={busy} onClick={() => setShowStatus((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
          Status ▾
        </button>
        {showStatus && (
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-slate-200 bg-slate-50 shadow-xl">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-100 transition-colors ${currentStatus === s ? "text-amber-700" : "text-slate-600"}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-red-600/20 disabled:opacity-50 transition-colors">
        <Trash2 size={12} /> {busy ? "…" : "Delete"}
      </button>
    </div>
  );
}
