"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { mutate, errorMessage } from "@/lib/api";

export default function CancelOrderButton({ orderId, label = "Cancel this order" }: { orderId: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function cancel() {
    if (!confirm("Cancel this order? The reserved stock goes back to the supplier.")) return;
    setBusy(true);
    setErr("");
    try {
      await mutate(`/api/orders/${orderId}/cancel`);
      router.refresh();
    } catch (e) {
      setErr(errorMessage(e, "Could not cancel this order"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={cancel} disabled={busy} className="btn-secondary w-full">
        <XCircle size={16} /> {busy ? "Cancelling…" : label}
      </button>
      {err && <p className="text-xs text-brand">{err}</p>}
    </div>
  );
}
