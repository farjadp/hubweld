"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/money";

type Item = { id: string; productId: string; slug: string; name: string; imageUrl: string; priceCents: number; quantity: number; stock: number };

export default function CartItems({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function update(id: string, quantity: number) {
    setBusy(id);
    await fetch(`/api/cart/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) });
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, quantity } : i)));
    setBusy(null);
    router.refresh();
  }
  async function remove(id: string) {
    setBusy(id);
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    setItems((arr) => arr.filter((i) => i.id !== id));
    setBusy(null);
    router.refresh();
  }

  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.id} className="card flex gap-4 p-3">
          <Link href={`/shop/p/${i.slug}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {i.imageUrl && <img src={i.imageUrl} alt={i.name} className="h-full w-full object-cover" />}
          </Link>
          <div className="flex flex-1 flex-col">
            <Link href={`/shop/p/${i.slug}`} className="font-bold hover:text-amber line-clamp-2">{i.name}</Link>
            <div className="text-sm text-slate-600">{formatCents(i.priceCents)} each</div>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 text-sm">
                <button disabled={!!busy} onClick={() => update(i.id, Math.max(1, i.quantity - 1))} className="px-3 py-1 hover:text-amber">−</button>
                <span className="w-10 text-center">{i.quantity}</span>
                <button disabled={!!busy} onClick={() => update(i.id, i.quantity + 1)} className="px-3 py-1 hover:text-amber">+</button>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black">{formatCents(i.priceCents * i.quantity)}</span>
                <button disabled={!!busy} onClick={() => remove(i.id)} className="text-xs text-slate-500 hover:text-brand">Remove</button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
