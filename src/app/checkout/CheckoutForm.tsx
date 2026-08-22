"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultName, company: "", address: "", city: "", region: "", postal: "",
    country: "CA", phone: "", notes: "", paymentMethod: "contact" as "contact" | "net30",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to place order"); return; }
    const data = await res.json();
    router.push(`/orders/${data.id}?success=1`);
  }

  return (
    <form onSubmit={submit} className="card space-y-5">
      <section>
        <h3 className="mb-3 font-bold">Shipping address</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Full name" required value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Company (optional)" value={form.company} onChange={(v) => set("company", v)} />
          <div className="md:col-span-2"><Field label="Street address" required value={form.address} onChange={(v) => set("address", v)} /></div>
          <Field label="City" required value={form.city} onChange={(v) => set("city", v)} />
          <Field label="State / Region" value={form.region} onChange={(v) => set("region", v)} />
          <Field label="Postal code" value={form.postal} onChange={(v) => set("postal", v)} />
          <div>
            <label className="label">Country</label>
            <select className="input" value={form.country} onChange={(e) => set("country", e.target.value)}>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="MX">Mexico</option>
            </select>
          </div>
          <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
        </div>
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
