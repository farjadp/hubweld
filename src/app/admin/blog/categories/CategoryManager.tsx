"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight } from "lucide-react";

type Cat = { id: string; slug: string; name: string; description: string; children: Cat[]; _count: { posts: number } };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CategoryManager({ initialCats }: { initialCats: Cat[] }) {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>(initialCats);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", parentId: "" });
  const [error, setError] = useState("");

  async function create() {
    if (!form.name || !form.slug) { setError("Name and slug are required."); return; }
    setBusy(true); setError("");
    const res = await fetch("/api/admin/blog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, slug: form.slug, description: form.description, parentId: form.parentId || null }),
    });
    setBusy(false);
    if (!res.ok) { setError("Slug already exists or error."); return; }
    setForm({ name: "", slug: "", description: "", parentId: "" });
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("Delete this category? Posts will need to be re-assigned.")) return;
    await fetch(`/api/admin/blog/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const allFlat: Cat[] = cats.flatMap((c) => [c, ...c.children]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* List */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="border-b border-white/5 bg-[#0d0f11] px-5 py-3">
          <span className="text-xs font-black uppercase tracking-widest text-white/30">Categories</span>
        </div>
        {cats.length === 0 ? (
          <p className="p-6 text-sm text-white/30">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {cats.map((cat) => (
              <li key={cat.id}>
                <div className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="font-semibold text-white">{cat.name}</div>
                    <div className="text-xs text-white/30">/{cat.slug} · {cat._count.posts} posts</div>
                  </div>
                  <button onClick={() => del(cat.id)} className="flex items-center gap-1 rounded-lg border border-red-600/20 bg-red-600/10 px-2 py-1 text-xs text-red-400 hover:bg-red-600/20 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
                {cat.children.length > 0 && (
                  <ul className="border-t border-white/5">
                    {cat.children.map((child: any) => (
                      <li key={child.id} className="flex items-center justify-between bg-white/[0.02] px-5 py-2.5">
                        <div className="flex items-center gap-2 text-sm">
                          <ChevronRight size={12} className="text-white/20" />
                          <span className="text-white/70">{child.name}</span>
                          <span className="text-xs text-white/20">/{child.slug}</span>
                        </div>
                        <button onClick={() => del(child.id)} className="flex items-center gap-1 rounded-lg border border-red-600/20 bg-red-600/10 px-2 py-1 text-xs text-red-400 hover:bg-red-600/20 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create form */}
      <div className="rounded-xl border border-white/10 bg-[#111315] p-6">
        <h2 className="mb-5 text-sm font-black uppercase tracking-widest text-white/30">New Category</h2>
        <div className="grid gap-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
              placeholder="e.g. Welding Tips"
            />
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input className="input font-mono text-sm" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder="welding-tips" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
          </div>
          <div>
            <label className="label">Parent Category (optional)</label>
            <select className="input" value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
              <option value="">— Top level —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={create} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
            <Plus size={15} /> {busy ? "Creating…" : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
}
