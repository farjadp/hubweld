"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate, errorMessage } from "@/lib/api";

export default function FulfillButton({ itemId, status }: { itemId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (status === "FULFILLED") return <span className="badge bg-amber/20 text-amber">Fulfilled</span>;
  if (status === "CANCELLED") return <span className="badge bg-slate-100">Cancelled</span>;

  async function mark() {
    setBusy(true);
    setErr("");
    try {
      await mutate(`/api/supplier/order-items/${itemId}`, { body: { status: "FULFILLED" } });
      router.refresh();
    } catch (e) {
      setErr(errorMessage(e, "Could not mark this item fulfilled"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button onClick={mark} disabled={busy} className="btn-primary text-xs">
        {busy ? "…" : "Mark fulfilled"}
      </button>
      {err && <p className="mt-1 text-xs text-brand">{err}</p>}
    </div>
  );
}
