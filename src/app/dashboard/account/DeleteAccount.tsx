"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { mutate, errorMessage } from "@/lib/api";

/**
 * Self-service account deletion. Both app stores require a web page where a
 * user can delete their account, as well as the in-app option; this is it.
 * What is removed and what is kept is explained in DELETE /api/account.
 */
export default function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await mutate("/api/account", { method: "DELETE", body: { password } });
      await signOut({ callbackUrl: "/" });
    } catch (e2) {
      setErr(errorMessage(e2, "Could not delete your account"));
      setBusy(false);
    }
  }

  return (
    <section id="delete" className="card mt-8 space-y-3 border-brand/30">
      <h2 className="font-display text-xl font-bold uppercase tracking-wide">Delete account</h2>
      <p className="text-sm text-slate-600">
        This removes your name, email, phone, profile, photos and résumé, closes your open jobs and withdraws
        your pending bids. Records of past orders are kept, as tax law requires. It cannot be undone.
      </p>
      {!open ? (
        <button type="button" className="btn-secondary" onClick={() => setOpen(true)}>
          Delete my account
        </button>
      ) : (
        <form onSubmit={confirm} className="space-y-3">
          <div>
            <label className="label">Confirm with your password</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <p className="rounded-sm border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-brand">{err}</p>}
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>{busy ? "Deleting…" : "Permanently delete"}</button>
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); setPassword(""); setErr(""); }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
