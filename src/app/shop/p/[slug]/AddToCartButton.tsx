"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId, maxStock }: { productId: string; maxStock: number }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  /** Returns true once the line is in the cart. */
  async function add(): Promise<boolean> {
    setLoading(true); setMsg(null);
    const res = await fetch("/api/cart", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    setLoading(false);
    if (res.status === 401) { router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`); return false; }
    if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg(d.error || "Failed to add to cart"); return false; }
    setMsg("Added to cart");
    router.refresh();
    return true;
  }

  /**
   * "Request Quote / Net 30" used to be a plain link to /checkout. It never
   * added the product, so from a product page with an empty cart it bounced
   * the buyer to /cart — the Net 30 request they clicked for was nowhere.
   * It now puts the item in the cart first, then goes to checkout, where
   * Net 30 is one of the two settlement options.
   */
  async function quote() {
    if (await add()) router.push("/checkout");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">Qty</label>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:text-brand">−</button>
          <input value={qty} onChange={(e) => setQty(Math.max(1, Math.min(maxStock || 999, Number(e.target.value) || 1)))} className="w-12 bg-transparent text-center" />
          <button type="button" onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:text-brand">+</button>
        </div>
        <button onClick={add} disabled={loading} className="btn-primary flex-1">{loading ? "Adding..." : "Add to Cart"}</button>
      </div>
      <button type="button" onClick={quote} disabled={loading} className="btn-secondary w-full">Request Quote / Net 30</button>
      {msg && <p className="text-sm text-brand">{msg}</p>}
    </div>
  );
}
