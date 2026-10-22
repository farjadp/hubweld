"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mutate, errorMessage } from "@/lib/api";

export type ReportRowData = {
  id: string;
  targetType: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
  reporter: string;
  owner: { id: string; name: string; email: string; banned: boolean } | null;
  link: string | null;
};

const REMOVE_LABEL: Record<string, string> = {
  JOB: "Cancel job",
  PRODUCT: "Archive product",
  BID: "Delete bid",
  REVIEW: "Delete review",
  MESSAGE: "Delete message",
  USER: "Ban user",
};

export default function ReportRow({ report }: { report: ReportRowData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const open = report.status === "OPEN";

  async function call(url: string, body: object, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    try {
      setBusy(true);
      await mutate(url, { method: "POST", body });
      router.refresh();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`rounded-xl border bg-white p-4 ${open ? "border-red-600/30" : "border-slate-200 opacity-70"}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{report.targetType}</span>
        <span className="font-bold text-slate-900">{report.reason}</span>
        <span className="text-slate-400">· {new Date(report.createdAt).toLocaleString("en-CA")}</span>
        <span className={`ml-auto text-xs font-bold ${open ? "text-brand" : "text-slate-500"}`}>{report.status}</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        Against <strong>{report.owner?.name ?? "deleted content"}</strong>
        {report.owner ? <> ({report.owner.email}){report.owner.banned ? " · banned" : ""}</> : null} · reported by {report.reporter}
      </p>
      {report.details ? <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">&ldquo;{report.details}&rdquo;</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {report.link ? <a href={report.link} target="_blank" className="btn-secondary text-sm">Open content</a> : null}
        {open ? (
          <>
            <button disabled={busy} className="btn-primary text-sm" onClick={() => call(`/api/admin/reports/${report.id}`, { action: "remove" }, `${REMOVE_LABEL[report.targetType]}?`)}>
              {REMOVE_LABEL[report.targetType] ?? "Remove"}
            </button>
            {report.owner && !report.owner.banned && report.targetType !== "USER" ? (
              <button disabled={busy} className="btn-secondary text-sm" onClick={() => call(`/api/admin/users/${report.owner!.id}`, { action: "ban" }, `Ban ${report.owner!.name}?`)}>
                Ban {report.owner.name}
              </button>
            ) : null}
            <button disabled={busy} className="btn-secondary text-sm" onClick={() => call(`/api/admin/reports/${report.id}`, { action: "resolve" })}>Mark resolved</button>
            <button disabled={busy} className="btn-secondary text-sm" onClick={() => call(`/api/admin/reports/${report.id}`, { action: "dismiss" })}>Dismiss</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
