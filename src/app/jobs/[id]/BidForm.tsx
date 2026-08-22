"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BidForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const res = await fetch(`/api/jobs/${jobId}/bids`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), message }) });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to bid"); return; }
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <h3 className="font-bold">Place a bid</h3>
      <div><label className="label">Bid amount (CAD)</label><input className="input" type="number" min={1} required value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
      <div><label className="label">Message</label><textarea className="input min-h-24" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Approach, certifications, availability..." /></div>
      {err && <p className="text-sm text-brand">{err}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Submitting..." : "Submit Bid"}</button>
    </form>
  );
}
