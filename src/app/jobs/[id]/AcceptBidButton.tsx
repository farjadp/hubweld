"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcceptBidButton({ jobId, bidId }: { jobId: string; bidId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function accept() {
    if (!confirm("Accept this bid? Other bids will be rejected.")) return;
    setLoading(true);
    await fetch(`/api/jobs/${jobId}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bidId }) });
    router.refresh();
  }
  return <button onClick={accept} disabled={loading} className="btn-primary text-xs">{loading ? "..." : "Accept"}</button>;
}
