import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal";

export type LegalSection = { id: string; title: string; body: ReactNode };

/**
 * Shared layout for /privacy and /terms: title, last-updated line, a contents
 * list, then numbered sections. Each section has a stable id so the app and
 * the stores can link straight to it (e.g. /privacy#delete-account).
 */
export function LegalPage({ kicker, title, intro, sections }: { kicker: string; title: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <article className="mx-auto max-w-3xl py-12">
      <span className="section-label">{kicker}</span>
      <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-slate-900 md:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-machine text-slate-500">Last updated {LEGAL.lastUpdated}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-slate-700">{intro}</div>

      <nav aria-label="Contents" className="card mt-8 p-5">
        <h2 className="label">Contents</h2>
        <ol className="mt-2 gap-x-8 text-sm sm:columns-2">
          {sections.map((s, i) => (
            <li key={s.id} className="mb-1.5 break-inside-avoid">
              <a href={`#${s.id}`} className="text-slate-700 hover:text-brand">
                <span className="font-mono text-slate-400">{String(i + 1).padStart(2, "0")}</span> {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
              <span className="mr-2 font-mono text-base text-brand">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            <div className="mt-3 space-y-3 leading-relaxed text-slate-700">{s.body}</div>
          </section>
        ))}
      </div>
    </article>
  );
}
