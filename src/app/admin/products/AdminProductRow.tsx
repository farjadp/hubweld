"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type P = { id: string; name: string; slug: string; sku: string; status: string; priceCents: number; stock: number; supplierName: string; categoryName: string; imageUrl: string };

export default function AdminProductRow({ product, formattedPrice }: { product: P; formattedPrice: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function setStatus(status: string) {
    setBusy(true);
    await fetch(`/api/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(false);
    router.refresh();
  }
  async function del() {
    if (!confirm("Delete this product?")) return;
    setBusy(true);
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }
  return (
    <li className="card flex flex-wrap items-center gap-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">{product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
      <div className="flex-1 min-w-0">
        <Link href={`/shop/p/${product.slug}`} className="font-bold hover:text-amber line-clamp-1">{product.name}</Link>
        <div className="text-xs text-white/60">{product.supplierName} · {product.categoryName} · SKU {product.sku}</div>
      </div>
      <div className="text-right text-sm">
        <div className="font-black">{formattedPrice}</div>
        <div className="text-xs text-white/50">Stock {product.stock}</div>
      </div>
      <span className="badge bg-white/10 text-xs">{product.status}</span>
      <div className="flex gap-1">
        <Link href={`/admin/products/${product.id}/edit`} className="btn-secondary text-xs">Edit</Link>
        {product.status !== "ACTIVE" && <button disabled={busy} onClick={() => setStatus("ACTIVE")} className="btn-primary text-xs">Activate</button>}
        {product.status !== "ARCHIVED" && <button disabled={busy} onClick={() => setStatus("ARCHIVED")} className="btn-secondary text-xs">Archive</button>}
        <button disabled={busy} onClick={del} className="btn-secondary text-xs text-red-400 hover:text-red-300">Delete</button>
      </div>
    </li>
  );
}
