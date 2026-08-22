"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultName, company: "", address: "", city: "", region: "", postal: "",
    country: "US", phone: "", notes: "", paymentMethod: "card" as "card" | "net30",
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
        <h3 className="mb-3 font-bold">Payment method</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {(["card", "net30"] as const).map((m) => (
            <button key={m} type="button" onClick={() => set("paymentMethod", m)}
              className={`rounded-xl border p-3 text-left text-sm transition ${form.paymentMethod === m ? "border-amber/60 bg-amber/10" : "border-slate-200 bg-slate-100 hover:bg-slate-100"}`}>
              <div className="font-bold">{m === "card" ? "Credit card" : "Net 30 invoice"}</div>
              <div className="text-slate-600">{m === "card" ? "Pay immediately (sandbox — no real charge)" : "Invoice issued, due in 30 days"}</div>
            </button>
          ))}
        </div>
        {form.paymentMethod === "card" && (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2"><Field label="Card number" value="4242 4242 4242 4242" onChange={() => {}} /></div>
            <Field label="Exp / CVC" value="12/29 · 123" onChange={() => {}} />
            <p className="md:col-span-3 text-xs text-slate-500">Sandbox mode: any card details are accepted. Stripe integration is a stub.</p>
          </div>
        )}
      </section>

      <section>
        <label className="label">Order notes (optional)</label>
        <textarea className="input min-h-20" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="PO number, delivery instructions, etc." />
      </section>

      {err && <p className="text-sm text-brand">{err}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Placing order..." : "Place Order"}</button>
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
