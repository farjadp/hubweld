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
      <Link href={`/admin/jobs/${id}/edit`} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 transition-colors">
        <Pencil size={12} /> Edit
      </Link>

      {/* Status */}
      <div className="relative">
        <button disabled={busy} onClick={() => setShowStatus((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-50 transition-colors">
          Status ▾
        </button>
        {showStatus && (
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-white/10 bg-[#1a1d1f] shadow-xl">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/5 transition-colors ${currentStatus === s ? "text-amber-400" : "text-white/60"}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-600/20 disabled:opacity-50 transition-colors">
        <Trash2 size={12} /> {busy ? "…" : "Delete"}
      </button>
    </div>
  );
}
