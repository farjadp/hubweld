import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Server-rendered pagination.
 *
 * Listings used to take a fixed slice (the shop capped at 60) and then label
 * it with the slice length, so a 449-product catalogue advertised "60 items"
 * and the rest was unreachable. Every listing now reports the real total and
 * lets you walk it.
 *
 * Links carry the current query string so filters and search survive paging.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  params = {},
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Compact window: first, last, and the pages either side of the current one.
  const windowed: (number | "gap")[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) windowed.push(p);
    else if (windowed[windowed.length - 1] !== "gap") windowed.push("gap");
  }

  const box = "inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-3 font-mono text-xs uppercase tracking-wider transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="Previous page"
          className={`${box} border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50`}>
          <ChevronLeft size={14} />
        </Link>
      ) : (
        <span aria-hidden className={`${box} border-slate-200 bg-slate-50 text-slate-300`}><ChevronLeft size={14} /></span>
      )}

      {windowed.map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 font-mono text-xs text-slate-400">…</span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={`${box} border-brand bg-brand font-semibold text-white`}>{p}</span>
        ) : (
          <Link key={p} href={href(p)} className={`${box} border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50`}>{p}</Link>
        )
      )}

      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" aria-label="Next page"
          className={`${box} border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50`}>
          <ChevronRight size={14} />
        </Link>
      ) : (
        <span aria-hidden className={`${box} border-slate-200 bg-slate-50 text-slate-300`}><ChevronRight size={14} /></span>
      )}
    </nav>
  );
}

/** Clamp a `?page=` value to something sane. */
export function parsePage(raw: string | undefined, pageCount: number): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(1, pageCount));
}
