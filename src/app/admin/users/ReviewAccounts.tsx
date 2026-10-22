"use client";
import { useState } from "react";
import { mutate, errorMessage } from "@/lib/api";

type Result = { expiresAt: string; accounts: { role: string; email: string; password: string }[] };

/**
 * One button for the app store review accounts. Passwords are shown once,
 * here, so they can be typed into App Store Connect and Play Console.
 */
export default function ReviewAccounts() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    if (!confirm("Create or reset the three review accounts? Any previous review passwords stop working.")) return;
    try {
      setBusy(true);
      setResult(await mutate<Result>("/api/admin/review-accounts", { method: "POST" }));
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-slate-900">App review accounts</p>
          <p className="text-sm text-slate-500">Customer, welder and supplier logins for Apple and Google reviewers. They expire after 30 days.</p>
        </div>
        <button className="btn-primary text-sm" disabled={busy} onClick={run}>{busy ? "Working…" : "Create / reset"}</button>
      </div>
      {result ? (
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-slate-600">Copy these now; they are not shown again. Valid until {new Date(result.expiresAt).toLocaleDateString("en-CA")}.</p>
          {result.accounts.map((a) => (
            <div key={a.email} className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 font-mono">
              <span className="font-sans font-bold text-slate-700">{a.role.toLowerCase()}</span>
              <span className="select-all">{a.email}</span>
              <span className="select-all">{a.password}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
