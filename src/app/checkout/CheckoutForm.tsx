"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/money";
import { cartTotals } from "@/lib/totals";
import { errorMessage } from "@/lib/api";

type Item = { id: string; name: string; priceCents: number; quantity: number; imageUrl: string };

export default function CheckoutForm({ defaultName, items }: { defaultName: string; items: Item[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultName, company: "", address: "", city: "", region: "", postal: "",
    country: "CA", phone: "", notes: "", paymentMethod: "contact" as "contact" | "net30",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  // Priced client-side from the same helper the API uses, so the figure the
  // buyer approves is the figure the order is written with.
  const totals = useMemo(
    () => cartTotals(items, { country: form.country, region: form.region }),
    [items, form.country, form.region]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to place order");
      }
      const data = await res.json();
      router.push(`/orders/${data.id}?success=1`);
    } catch (e) {
      setErr(errorMessage(e, "Failed to place order"));
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="card space-y-5">
        <section>
          <h3 className="mb-3 font-bold">Shipping address</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Full name" required value={form.name} onChange={(v) => set("name", v)} />
            <Field label="Company (optional)" value={form.company} onChange={(v) => set("company", v)} />
            <div className="md:col-span-2"><Field label="Street address" required value={form.address} onChange={(v) => set("address", v)} /></div>
            <Field label="City" required value={form.city} onChange={(v) => set("city", v)} />
            <Field
              label={form.country === "CA" ? "Province" : "State / Region"}
              value={form.region}
              onChange={(v) => set("region", v)}
              required={form.country === "CA"}
            />
            <Field label="Postal code" value={form.postal} onChange={(v) => set("postal", v)} />
            <div>
              <label className="label">Country</label>
              <select className="input" value={form.country} onChange={(e) => set("country", e.target.value)}>
                <option value="CA">Canada</option>
                <option value="US">United States</option>
                <option value="MX">Mexico</option>
              </select>
            </div>
            <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
          </div>
          {form.country === "CA" && !totals.tax.resolved && (
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              Enter your province to see the tax
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-3 font-bold">Payment</h3>

          {/* No gateway is connected. Say so plainly rather than taking a
              fake card number and marking the order paid. */}
          <div className="rounded-sm border border-amber-500/40 bg-amber-50 p-4">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-amber-900">
              Card payments are temporarily unavailable
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-900/90">
              We are reconnecting our payment gateway, so we cannot take a card right now — and we will not
              ask you for card details. You can still place the order: we will record and reserve it, then
              contact you to confirm and arrange payment, by invoice, transfer, or card over the phone.
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-amber-900/70">
              Nothing is charged today
            </p>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {(["contact", "net30"] as const).map((m) => (
              <button key={m} type="button" onClick={() => set("paymentMethod", m)}
                className={`rounded-sm border p-3 text-left text-sm transition ${form.paymentMethod === m ? "border-brand/60 bg-brand/5" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                <div className="font-bold">{m === "contact" ? "Contact me to arrange payment" : "Request Net 30 invoice"}</div>
                <div className="text-slate-600">{m === "contact" ? "We call or email you to settle it" : "For approved business accounts, due in 30 days"}</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="label">Order notes (optional)</label>
          <textarea className="input min-h-20" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="PO number, delivery instructions, etc." />
        </section>

        {err && <p className="text-sm text-brand">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Submitting…" : "Submit Order Request"}</button>
      </form>

      <aside className="card h-fit sticky top-24">
        <h3 className="mb-3 font-bold">Order summary</h3>
        <ul className="mb-3 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex gap-2">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {i.imageUrl && <img src={i.imageUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="line-clamp-2 leading-tight">{i.name}</div>
                <div className="text-xs text-slate-500">Qty {i.quantity}</div>
              </div>
              <div className="font-bold">{formatCents(i.priceCents * i.quantity)}</div>
            </li>
          ))}
        </ul>
        <div className="my-3 h-px bg-slate-100" />
        <Row label="Subtotal" value={formatCents(totals.subtotalCents)} />
        <Row label={totals.shippingCents === 0 ? "Shipping (free over $500)" : "Shipping"} value={formatCents(totals.shippingCents)} />
        <Row
          label={totals.tax.label}
          value={totals.tax.resolved ? formatCents(totals.taxCents) : "—"}
        />
        <div className="my-3 h-px bg-slate-100" />
        <Row label={totals.tax.resolved ? "Total" : "Total before tax"} value={formatCents(totals.totalCents)} bold />
        <p className="mt-3 text-xs text-slate-500">
          Charged in Canadian dollars. Nothing is charged today — we confirm the final amount with you
          before any payment is taken.
        </p>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${bold ? "text-base font-black" : "text-slate-700"}`}>
      <span>{label}</span><span className="text-slate-900">{value}</span>
    </div>
  );
}
