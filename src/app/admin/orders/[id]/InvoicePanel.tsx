"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Banknote } from "lucide-react";
import { mutate, errorMessage } from "@/lib/api";
import { formatCents } from "@/lib/money";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/lib/invoices";

export type PaymentData = {
  id: string;
  method: string;
  amountCents: number;
  paidAt: string;
  exchangeName: string;
  exchangeBranch: string;
  exchangeCountry: string;
  localCurrency: string;
  localAmount: number | null;
  localFee: number | null;
  rate: number | null;
  reference: string;
  notes: string;
  recordedBy: string;
};

export type InvoiceData = {
  id: string;
  number: string;
  amountCents: number;
  status: string;
  issuedAt: string;
  dueAt: string | null;
  notes: string;
  payments: PaymentData[];
};

// Where buyers abroad usually pay, and in what. Only a starting point for the form.
const LOCAL_CURRENCY: Record<string, string> = { AE: "AED", TR: "USD", IQ: "USD" };
const EXCHANGE_COUNTRIES = ["UAE", "Turkey", "Iraq", "Oman", "Armenia", "Other"];
const CURRENCIES = ["AED", "USD", "TRY", "IQD", "EUR", "OMR", "AMD", "CAD"];

const STATUS_STYLE: Record<string, string> = {
  ISSUED: "bg-amber-600/15 text-amber-700",
  PAID: "bg-green-600/15 text-green-700",
  VOID: "bg-slate-100 text-slate-500",
};

const date = (iso: string) => new Date(iso).toLocaleDateString("en-CA");
const toCents = (v: string) => Math.round(Number(v) * 100);

export default function InvoicePanel({
  orderId, orderStatus, orderTotalCents, shipCountry, invoices,
}: {
  orderId: string;
  orderStatus: string;
  orderTotalCents: number;
  shipCountry: string;
  invoices: InvoiceData[];
}) {
  const live = invoices.find((i) => i.status !== "VOID");
  const canIssue = !live && orderStatus !== "CANCELLED";

  return (
    <section className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><FileText size={16} /> Invoice &amp; payment</h2>
      {invoices.length === 0 && !canIssue && <p className="text-sm text-slate-500">This order was cancelled before it was invoiced.</p>}
      {canIssue && <IssueForm orderId={orderId} defaultCents={orderTotalCents} />}
      <div className="mt-3 space-y-4">
        {invoices.map((inv) => (
          <InvoiceCard key={inv.id} invoice={inv} shipCountry={shipCountry} orderCancelled={orderStatus === "CANCELLED"} />
        ))}
      </div>
    </section>
  );
}

function IssueForm({ orderId, defaultCents }: { orderId: string; defaultCents: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState((defaultCents / 100).toFixed(2));
  const [dueDays, setDueDays] = useState("7");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await mutate(`/api/admin/orders/${orderId}/invoices`, { body: { amountCents: toCents(amount), dueDays: Number(dueDays), notes } });
      router.refresh();
    } catch (e) {
      setErr(errorMessage(e, "Could not issue the invoice"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-sm border border-dashed border-slate-300 p-4 sm:grid-cols-[1fr_120px]">
      <p className="text-sm text-slate-600 sm:col-span-2">Not invoiced yet. Issue the invoice once the buyer has confirmed the order on the follow-up call.</p>
      <label>
        <span className="label">Amount (CAD)</span>
        <input className="input" type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label>
        <span className="label">Due in (days)</span>
        <input className="input" type="number" min="0" max="120" required value={dueDays} onChange={(e) => setDueDays(e.target.value)} />
      </label>
      <label className="sm:col-span-2">
        <span className="label">Note on the invoice</span>
        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Pay through your exchange house in CAD or USD" />
      </label>
      <div className="sm:col-span-2">
        <button className="btn-primary" disabled={busy}>{busy ? "Issuing…" : "Issue invoice"}</button>
        {err && <p className="mt-2 text-xs text-brand">{err}</p>}
      </div>
    </form>
  );
}

function InvoiceCard({ invoice, shipCountry, orderCancelled }: { invoice: InvoiceData; shipCountry: string; orderCancelled: boolean }) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");
  const paid = invoice.payments.reduce((a, p) => a + p.amountCents, 0);
  const outstanding = invoice.amountCents - paid;
  const overdue = invoice.status === "ISSUED" && invoice.dueAt && new Date(invoice.dueAt) < new Date();

  async function voidInvoice() {
    if (!confirm(`Void ${invoice.number}? The order can then be invoiced again.`)) return;
    try {
      await mutate(`/api/admin/invoices/${invoice.id}/void`);
      router.refresh();
    } catch (e) {
      setErr(errorMessage(e, "Could not void the invoice"));
    }
  }

  return (
    <div className={`rounded-sm border p-4 ${invoice.status === "VOID" ? "border-slate-200 opacity-60" : "border-slate-300"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono font-bold text-slate-900">{invoice.number}</span>
        <span className={`badge ${STATUS_STYLE[invoice.status] ?? "bg-slate-100"}`}>{invoice.status}</span>
        {overdue && <span className="badge bg-red-600/15 text-brand">Overdue</span>}
        <span className="ml-auto font-mono font-bold">{formatCents(invoice.amountCents)}</span>
      </div>
      <div className="mt-1 text-xs text-slate-500">
        Issued {date(invoice.issuedAt)}{invoice.dueAt ? ` · due ${date(invoice.dueAt)}` : ""}
        {invoice.status !== "VOID" && <> · paid {formatCents(paid)} · outstanding {formatCents(Math.max(0, outstanding))}</>}
      </div>
      {invoice.notes && <p className="mt-1 text-xs text-slate-600">{invoice.notes}</p>}

      {invoice.payments.length > 0 && (
        <ul className="mt-3 space-y-2">
          {invoice.payments.map((p) => <PaymentRow key={p.id} p={p} />)}
        </ul>
      )}

      {invoice.status === "ISSUED" && !orderCancelled && (
        <div className="mt-3">
          {paying ? (
            <PaymentForm invoice={invoice} outstanding={outstanding} shipCountry={shipCountry} onClose={() => setPaying(false)} />
          ) : (
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary text-sm" onClick={() => setPaying(true)}><Banknote size={16} /> Mark as paid</button>
              {invoice.payments.length === 0 && <button className="btn-secondary text-sm" onClick={voidInvoice}>Void</button>}
            </div>
          )}
        </div>
      )}
      {err && <p className="mt-2 text-xs text-brand">{err}</p>}
    </div>
  );
}

function PaymentRow({ p }: { p: PaymentData }) {
  const fmt = (n: number) => n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const local = p.localAmount != null && p.localCurrency ? `${p.localCurrency} ${fmt(p.localAmount)}` : "";
  return (
    <li className="rounded-sm bg-slate-50 px-3 py-2 text-xs text-slate-700">
      <div className="flex flex-wrap justify-between gap-2">
        <span className="font-semibold text-slate-900">
          {formatCents(p.amountCents)} · {PAYMENT_METHOD_LABEL[p.method as PaymentMethod] ?? p.method} · {date(p.paidAt)}
        </span>
        <span className="text-slate-500">recorded by {p.recordedBy}</span>
      </div>
      {p.method === "EXCHANGE" && (
        <div className="mt-0.5">
          {p.exchangeName}{p.exchangeBranch ? `, ${p.exchangeBranch}` : ""}{p.exchangeCountry ? ` (${p.exchangeCountry})` : ""}
          {local && <> · paid {local}{p.localFee ? ` + ${fmt(p.localFee)} fee` : ""}</>}
          {p.rate ? <> · 1 CAD = {p.rate} {p.localCurrency}</> : null}
        </div>
      )}
      {p.reference && <div className="mt-0.5 font-mono">Ref {p.reference}</div>}
      {p.notes && <div className="mt-0.5 text-slate-500">{p.notes}</div>}
    </li>
  );
}

function PaymentForm({ invoice, outstanding, shipCountry, onClose }: { invoice: InvoiceData; outstanding: number; shipCountry: string; onClose: () => void }) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("EXCHANGE");
  const [amount, setAmount] = useState((outstanding / 100).toFixed(2));
  // en-CA renders YYYY-MM-DD in the admin's own timezone; toISOString would be tomorrow every evening.
  const [paidAt, setPaidAt] = useState(new Date().toLocaleDateString("en-CA"));
  const [exchangeName, setExchangeName] = useState("");
  const [exchangeBranch, setExchangeBranch] = useState("");
  const [exchangeCountry, setExchangeCountry] = useState("");
  const [localCurrency, setLocalCurrency] = useState(LOCAL_CURRENCY[shipCountry.toUpperCase()] ?? "");
  const [localAmount, setLocalAmount] = useState("");
  const [localFee, setLocalFee] = useState("");
  const [rate, setRate] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const exchange = method === "EXCHANGE";
  const full = toCents(amount) >= outstanding;
  // The rate the buyer actually got, when ops typed the counter amount but not the rate.
  const impliedRate = localAmount && Number(amount) > 0 ? Number(localAmount) / Number(amount) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    try {
      await mutate(`/api/admin/invoices/${invoice.id}/payments`, {
        body: {
          method,
          amountCents: toCents(amount),
          paidAt,
          reference,
          notes,
          ...(exchange
            ? {
                exchangeName, exchangeBranch, exchangeCountry, localCurrency,
                localAmount: num(localAmount),
                localFee: num(localFee),
                rate: num(rate) ?? (impliedRate ? Math.round(impliedRate * 10000) / 10000 : null),
              }
            : {}),
        },
      });
      onClose();
      router.refresh();
    } catch (e) {
      setErr(errorMessage(e, "Could not record the payment"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-sm border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
      <label>
        <span className="label">Method</span>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>)}
        </select>
      </label>
      <label>
        <span className="label">Credited (CAD)</span>
        <input className="input" type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label>
        <span className="label">Paid on</span>
        <input className="input" type="date" required value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
      </label>

      {exchange && (
        <>
          <label>
            <span className="label">Exchange house</span>
            <input className="input" required value={exchangeName} onChange={(e) => setExchangeName(e.target.value)} placeholder="Sarrafi …" />
          </label>
          <label>
            <span className="label">Branch / city</span>
            <input className="input" value={exchangeBranch} onChange={(e) => setExchangeBranch(e.target.value)} placeholder="Deira, Dubai" />
          </label>
          <label>
            <span className="label">Country</span>
            <input className="input" list="exchange-countries" value={exchangeCountry} onChange={(e) => setExchangeCountry(e.target.value)} />
            <datalist id="exchange-countries">{EXCHANGE_COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>
            <span className="label">Buyer paid in</span>
            <input className="input" list="local-currencies" maxLength={3} value={localCurrency} onChange={(e) => setLocalCurrency(e.target.value.toUpperCase())} />
            <datalist id="local-currencies">{CURRENCIES.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>
            <span className="label">Amount at counter</span>
            <input className="input" type="number" step="0.01" min="0" value={localAmount} onChange={(e) => setLocalAmount(e.target.value)} />
          </label>
          <label>
            <span className="label">Exchange fee</span>
            <input className="input" type="number" step="0.01" min="0" value={localFee} onChange={(e) => setLocalFee(e.target.value)} />
          </label>
          <label>
            <span className="label">Rate (1 CAD =)</span>
            <input className="input" type="number" step="0.0001" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={impliedRate ? impliedRate.toFixed(4) : ""} />
          </label>
        </>
      )}

      <label className={exchange ? "sm:col-span-2" : "sm:col-span-3"}>
        <span className="label">{exchange ? "Havaleh / transfer ref" : "Reference"}</span>
        <input className="input" required={exchange} value={reference} onChange={(e) => setReference(e.target.value)} />
      </label>
      <label className="sm:col-span-3">
        <span className="label">Notes</span>
        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-3">
        <button className="btn-primary text-sm" disabled={busy}>
          {busy ? "Saving…" : full ? `Mark ${invoice.number} paid` : "Record partial payment"}
        </button>
        <button type="button" className="btn-secondary text-sm" onClick={onClose}>Cancel</button>
        {err && <p className="text-xs text-brand">{err}</p>}
      </div>
    </form>
  );
}
