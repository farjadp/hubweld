"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function JobRow({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!confirm("Delete this job?")) return;
    setBusy(true);
    await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }
  return (
    <button disabled={busy} onClick={del} className="flex items-center gap-1.5 rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-600/20 disabled:opacity-50 transition-colors">
      <Trash2 size={12} /> {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
