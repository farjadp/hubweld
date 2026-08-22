"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Tag = { id: string; slug: string; name: string; _count: { posts: number } };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function TagManager({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    await fetch("/api/admin/blog/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug: slugify(name.trim()) }),
    });
    setBusy(false);
    setName("");
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("Delete tag?")) return;
    await fetch(`/api/admin/blog/tags/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* List */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">All Tags</span>
        </div>
        {initialTags.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No tags yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {initialTags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="font-medium text-slate-900">{tag.name}</span>
                  <span className="ml-2 text-xs text-slate-400">#{tag.slug} · {tag._count.posts} posts</span>
                </div>
                <button onClick={() => del(tag.id)} className="flex items-center gap-1 rounded-lg border border-red-600/20 bg-red-600/10 px-2 py-1 text-xs text-brand hover:bg-red-600/20 transition-colors">
                  <Trash2 size={11} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-sm font-black uppercase tracking-widest text-slate-400">New Tag</h2>
        <div className="grid gap-4">
          <div>
            <label className="label">Tag Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="e.g. MIG Welding"
            />
          </div>
          {name && (
            <p className="text-xs text-slate-400">Slug: <span className="font-mono text-slate-500">{slugify(name)}</span></p>
          )}
          <button onClick={create} disabled={busy || !name.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
            <Plus size={15} /> {busy ? "Creating…" : "Create Tag"}
          </button>
        </div>
      </div>
    </div>
  );
}
