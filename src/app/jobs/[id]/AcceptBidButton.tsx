"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate, errorMessage } from "@/lib/api";

export default function AcceptBidButton({ jobId, bidId }: { jobId: string; bidId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function accept() {
    if (!confirm("Accept this bid? Other bids will be rejected.")) return;
    setLoading(true);
    setErr("");
    try {
      await mutate(`/api/jobs/${jobId}/accept`, { body: { bidId } });
      router.refresh();
    } catch (e) {
      setErr(errorMessage(e, "Could not accept this bid"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button onClick={accept} disabled={loading} className="btn-primary text-xs">
        {loading ? "…" : "Accept"}
      </button>
      {err && <p className="mt-1 text-xs text-brand">{err}</p>}
    </div>
  );
}
