"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId, maxStock }: { productId: string; maxStock: number }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    setLoading(true); setMsg(null);
    const res = await fetch("/api/cart", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    setLoading(false);
    if (res.status === 401) { router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`); return; }
    if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg(d.error || "Failed to add to cart"); return; }
    setMsg("Added to cart");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">Qty</label>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:text-amber">−</button>
          <input value={qty} onChange={(e) => setQty(Math.max(1, Math.min(maxStock || 999, Number(e.target.value) || 1)))} className="w-12 bg-transparent text-center" />
          <button type="button" onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:text-amber">+</button>
        </div>
        <button onClick={add} disabled={loading} className="btn-primary flex-1">{loading ? "Adding..." : "Add to Cart"}</button>
      </div>
      <a href="/checkout" className="btn-secondary block text-center">Request Quote / Net 30</a>
      {msg && <p className="text-sm text-amber">{msg}</p>}
    </div>
  );
}
