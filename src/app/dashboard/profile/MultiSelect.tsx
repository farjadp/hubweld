"use client";
import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check, Search } from "lucide-react";

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle(opt: string) {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  }

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input flex min-h-11 w-full flex-wrap items-center gap-1.5 text-left"
      >
        {selected.length === 0 && <span className="text-slate-400">{placeholder}</span>}
        {selected.map((s) => (
          <span
            key={s}
            onClick={(e) => { e.stopPropagation(); toggle(s); }}
            className="inline-flex items-center gap-1 rounded-full bg-red-600/20 px-2 py-0.5 text-xs text-brand-light hover:bg-red-600/30"
          >
            {s} <X size={11} />
          </span>
        ))}
        <ChevronDown size={15} className="ml-auto shrink-0 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
            <Search size={14} className="text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-400">No matches.</p>
            ) : (
              filtered.map((opt) => {
                const isSel = selected.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggle(opt)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition-colors hover:bg-slate-100 ${isSel ? "text-brand-light" : "text-slate-700"}`}
                  >
                    {opt}
                    {isSel && <Check size={14} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
