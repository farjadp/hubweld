"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FulfillButton({ itemId, status }: { itemId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (status === "FULFILLED") return <span className="badge bg-amber/20 text-amber">Fulfilled</span>;
  if (status === "CANCELLED") return <span className="badge bg-white/10">Cancelled</span>;
  async function mark() {
    setBusy(true);
    await fetch(`/api/supplier/order-items/${itemId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "FULFILLED" }) });
    setBusy(false);
    router.refresh();
  }
  return <button onClick={mark} disabled={busy} className="btn-primary text-xs">{busy ? "..." : "Mark fulfilled"}</button>;
}
