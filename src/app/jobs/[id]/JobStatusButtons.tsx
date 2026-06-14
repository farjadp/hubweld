"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, CheckCircle2, XCircle } from "lucide-react";

export default function JobStatusButtons({
  jobId,
  status,
  isOwner,
  isAssignedWelder,
}: {
  jobId: string;
  status: string;
  isOwner: boolean;
  isAssignedWelder: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function transition(newStatus: string) {
    if (!confirm(`Mark job as ${newStatus.replace("_", " ")}?`)) return;
    setLoading(true);
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {status === "ASSIGNED" && (isAssignedWelder || isOwner) && (
        <button
          disabled={loading}
          onClick={() => transition("IN_PROGRESS")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          <PlayCircle size={16} /> Start Work
        </button>
      )}
      {status === "IN_PROGRESS" && isOwner && (
        <button
          disabled={loading}
          onClick={() => transition("COMPLETED")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
        >
          <CheckCircle2 size={16} /> Mark as Completed
        </button>
      )}
      {status !== "COMPLETED" && status !== "CANCELLED" && isOwner && (
        <button
          disabled={loading}
          onClick={() => transition("CANCELLED")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-600/20 disabled:opacity-50 transition-colors"
        >
          <XCircle size={16} /> Cancel Job
        </button>
      )}
    </div>
  );
}
