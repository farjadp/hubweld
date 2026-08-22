"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { mutate, errorMessage } from "@/lib/api";

export default function ConfirmReceiptButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function confirmReceipt() {
    if (!confirm("Confirm you have received everything in this order?")) return;
    setBusy(true);
    setErr("");
    try {
      await mutate(`/api/orders/${orderId}/receive`);
      router.refresh();
    } catch (e) {
      setErr(errorMessage(e, "Could not close this order"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={confirmReceipt} disabled={busy} className="btn-primary w-full">
        <PackageCheck size={16} /> {busy ? "Confirming…" : "Confirm receipt"}
      </button>
      {err && <p className="text-xs text-brand">{err}</p>}
    </div>
  );
}
