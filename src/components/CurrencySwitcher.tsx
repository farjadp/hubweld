"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, Check } from "lucide-react";
import { CURRENCIES, CURRENCY_COOKIE, CURRENCY_LABEL, type Currency } from "@/lib/currency";

/**
 * Display-currency picker. Writes a preference cookie and refreshes so the
 * server components re-render prices. Prices are always settled in CAD; the
 * other options are indicative conversions, which the menu says plainly.
 */
export function CurrencySwitcher({ current }: { current: Currency }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(c: Currency) {
    document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change display currency"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-sm px-2 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
        disabled={pending}
      >
        {current}
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-plate">
          <div className="p-1.5">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => choose(c)}
                className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span className="font-mono text-xs uppercase tracking-wider">{CURRENCY_LABEL[c]}</span>
                {c === current && <Check size={13} className="text-brand" />}
              </button>
            ))}
          </div>
          <p className="border-t border-slate-200 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
            Orders are charged in Canadian dollars. Other currencies are indicative conversions.
          </p>
        </div>
      )}
    </div>
  );
}
