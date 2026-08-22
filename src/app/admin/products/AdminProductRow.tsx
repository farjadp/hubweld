"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate, errorMessage } from "@/lib/api";

type P = { id: string; name: string; slug: string; sku: string; status: string; priceCents: number; stock: number; supplierName: string; categoryName: string; imageUrl: string };

export default function AdminProductRow({ product, formattedPrice }: { product: P; formattedPrice: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function setStatus(status: string) {
    try {
      setBusy(true);
      await mutate(`/api/products/${product.id}`, { method: "PATCH", body: { status } });
      router.refresh();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function del() {
    try {
      if (!confirm("Delete this product?")) return;
      setBusy(true);
      await mutate(`/api/products/${product.id}`, { method: "DELETE" });
      setBusy(false);
      router.refresh();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <li className="card flex flex-wrap items-center gap-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
      <div className="flex-1 min-w-0">
        <Link href={`/shop/p/${product.slug}`} className="font-bold hover:text-amber line-clamp-1">{product.name}</Link>
        <div className="text-xs text-slate-600">{product.supplierName} · {product.categoryName} · SKU {product.sku}</div>
      </div>
      <div className="text-right text-sm">
        <div className="font-black">{formattedPrice}</div>
        <div className="text-xs text-slate-500">Stock {product.stock}</div>
      </div>
      <span className="badge bg-slate-100 text-xs">{product.status}</span>
      <div className="flex gap-1">
        <Link href={`/admin/products/${product.id}/edit`} className="btn-secondary text-xs">Edit</Link>
        {product.status !== "ACTIVE" && <button disabled={busy} onClick={() => setStatus("ACTIVE")} className="btn-primary text-xs">Activate</button>}
        {product.status !== "ARCHIVED" && <button disabled={busy} onClick={() => setStatus("ARCHIVED")} className="btn-secondary text-xs">Archive</button>}
        <button disabled={busy} onClick={del} className="btn-secondary text-xs text-brand hover:text-brand-light">Delete</button>
      </div>
    </li>
  );
}
