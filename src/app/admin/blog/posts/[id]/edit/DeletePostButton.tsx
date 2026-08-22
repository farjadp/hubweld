"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("Permanently delete this post?")) return;
    setBusy(true);
    await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE" });
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="flex items-center gap-2 rounded-xl border border-red-600/20 bg-red-600/10 px-4 py-2 text-sm font-semibold text-brand hover:bg-red-600/20 disabled:opacity-50 transition-colors"
    >
      <Trash2 size={14} /> {busy ? "Deleting…" : "Delete Post"}
    </button>
  );
}
