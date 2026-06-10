"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Cat = { id: string; name: string };
type Sup = { id: string; name: string };
type Initial = {
  name: string; brand: string; sku: string; slug: string; categoryId: string;
  priceCents: number; stock: number; imageUrl: string; description: string;
  status: string; featured: boolean; supplierId: string;
};
const blank: Initial = {
  name: "", brand: "", sku: "", slug: "", categoryId: "",
  priceCents: 0, stock: 0, imageUrl: "", description: "",
  status: "ACTIVE", featured: false, supplierId: "",
};

export default function AdminProductForm({
  mode, productId, categories, suppliers, initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  categories: Cat[];
  suppliers: Sup[];
  initial?: Partial<Initial>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>({
    ...blank,
    categoryId: categories[0]?.id ?? "",
    supplierId: suppliers[0]?.id ?? "",
    ...(initial ?? {}),
  });
  const [priceDollars, setPriceDollars] = useState(((initial?.priceCents ?? 0) / 100).toFixed(2));
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof Initial>(k: K, v: Initial[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const payload = { ...form, priceCents: Math.round(parseFloat(priceDollars || "0") * 100) };
    const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to save"); return; }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Product name</label>
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. ArcStream 250 MIG Inverter Welder" />
        </div>
        <div>
          <label className="label">Supplier (owner)</label>
          <select className="input" required value={form.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
            <option value="">Select supplier...</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Select...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} /></div>
        <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => set("sku", e.target.value)} /></div>
        <div>
          <label className="label">URL slug</label>
          <input className="input" required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="arcstream-250-mig" />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div><label className="label">Price (USD)</label><input className="input" required type="number" step="0.01" min="0" value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} /></div>
        <div><label className="label">Stock</label><input className="input" required type="number" min="0" value={form.stock} onChange={(e) => set("stock", Number(e.target.value) || 0)} /></div>
        <div className="md:col-span-2">
          <label className="label">Image URL</label>
          <input className="input" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-32" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured product
          </label>
        </div>
      </div>
      {form.imageUrl && (
        <div className="aspect-[4/3] max-w-xs overflow-hidden rounded-xl bg-white/5">
          <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
