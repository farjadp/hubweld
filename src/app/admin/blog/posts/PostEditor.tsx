"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, Save, Send, X, Plus, Sparkles, FileText, Link as LinkIcon, Loader2, CheckCircle2, ChevronDown, Upload } from "lucide-react";
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("@/components/RichEditor"), { ssr: false, loading: () => <div className="min-h-[420px] rounded-xl border border-white/10 bg-[#0d0f11] animate-pulse" /> });

type Cat = { id: string; name: string; parentId: string | null };
type Tag = { id: string; slug: string; name: string };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

// ── AI Panel ────────────────────────────────────────────────────────────────
function AiPanel({ onApply }: { onApply: (body: string, meta: any) => void }) {
  const [mode, setMode] = useState<"topic" | "rewrite" | "url">("topic");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [focus, setFocus] = useState<"SEO" | "AEO" | "GEO">("SEO");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ body: string; meta: any } | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true); setError(""); setResult(null);
    const res = await fetch("/api/admin/blog/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, topic, content, url, focus, length }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "AI error"); return; }
    const data = await res.json();
    setResult(data);
  }

  const tabs = [
    { id: "topic", label: "Topic / Rewrite", icon: FileText, desc: "Give a topic or paste draft text to rewrite" },
    { id: "url", label: "From URL", icon: LinkIcon, desc: "Paste a URL — AI scrapes and rewrites it" },
  ] as const;

  return (
    <div className="rounded-xl border border-white/10 bg-[#111315]">
      <div className="border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-red-400" />
          <span className="text-sm font-black text-white">AI Article Generator</span>
        </div>
      </div>

      <div className="p-5 grid gap-5">
        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id === "url" ? "url" : "topic"); setResult(null); }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${(id === "url" ? mode === "url" : mode !== "url") ? "border-red-600/40 bg-red-600/10 text-red-400" : "border-white/10 text-white/40 hover:text-white"}`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Input area */}
        {mode !== "url" ? (
          <div className="grid gap-3">
            <div>
              <label className="label">Mode</label>
              <div className="flex gap-2">
                {(["topic", "rewrite"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${mode === m ? "border-red-600/30 bg-red-600/10 text-red-400" : "border-white/10 text-white/30 hover:text-white"}`}>
                    {m === "topic" ? "New topic" : "Rewrite draft"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{mode === "topic" ? "Topic / Keywords" : "Your Draft Text"}</label>
              <textarea
                className="input min-h-[120px] resize-y text-sm"
                value={mode === "topic" ? topic : content}
                onChange={(e) => mode === "topic" ? setTopic(e.target.value) : setContent(e.target.value)}
                placeholder={mode === "topic" ? "e.g. How welding distributors can reduce lead times using digital platforms…" : "Paste your draft article here…"}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="label">Article URL</label>
            <input className="input text-sm" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article-to-rewrite" />
            <p className="mt-1.5 text-xs text-white/25">AI fetches the page, strips boilerplate, and rewrites it as original content.</p>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Optimise for</label>
            <div className="flex flex-wrap gap-1.5">
              {(["SEO", "AEO", "GEO"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFocus(f)} className={`rounded-full border px-2.5 py-1 text-xs font-black transition-colors ${focus === f ? "border-red-600/40 bg-red-600/10 text-red-400" : "border-white/10 text-white/30 hover:text-white"}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Length</label>
            <div className="flex flex-wrap gap-1.5">
              {([["short", "~600w"], ["medium", "~1200w"], ["long", "~2000w"]] as const).map(([l, lbl]) => (
                <button key={l} type="button" onClick={() => setLength(l)} className={`rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${length === l ? "border-red-600/40 bg-red-600/10 text-red-400" : "border-white/10 text-white/30 hover:text-white"}`}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-2 text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition-colors"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> Generate with AI</>}
        </button>

        {/* Result preview */}
        {result && (
          <div className="grid gap-3">
            <div className="rounded-xl border border-green-600/20 bg-green-600/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-400">
                <CheckCircle2 size={14} /> Article generated
              </div>
              {result.meta && (
                <div className="grid gap-1 text-xs text-white/50">
                  {result.meta.suggestedTitle && <div><span className="text-white/30">Title:</span> {result.meta.suggestedTitle}</div>}
                  {result.meta.focusType && <div><span className="text-white/30">Focus:</span> {result.meta.focusType} · {result.meta.wordCount} words · {result.meta.readingMinutes} min read</div>}
                  {result.meta.seoKeywords && <div><span className="text-white/30">Keywords:</span> {result.meta.seoKeywords}</div>}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onApply(result.body, result.meta)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <CheckCircle2 size={14} className="text-green-400" /> Apply to Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cover image upload ───────────────────────────────────────────────────────
function CoverImageInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/blog/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) { alert("Upload failed"); return; }
    const { url } = await res.json();
    onChange(url);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
      <label className="label">Cover Image</label>
      <div className="flex gap-2">
        <input className="input flex-1 text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload →" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors">
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      </div>
      {value && (
        <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
          <img src={value} alt="cover" className="h-40 w-full object-cover" />
        </div>
      )}
    </div>
  );
}

// ── Main PostEditor ───────────────────────────────────────────────────────────
export default function PostEditor({
  categories, allTags, post,
}: {
  categories: Cat[];
  allTags: Tag[];
  post?: any;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"write" | "ai">("write");

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags?.map((t: any) => t.tag.slug) ?? []);
  const [newTag, setNewTag] = useState("");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seoDesc ?? "");
  const [seoKeywords, setSeoKeywords] = useState(post?.seoKeywords ?? "");

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!post) setSlug(slugify(v));
    if (!seoTitle) setSeoTitle(v);
  }

  function applyAI(aiBody: string, meta: any) {
    setBody(aiBody);
    if (meta?.suggestedTitle && !title) handleTitleChange(meta.suggestedTitle);
    if (meta?.seoTitle) setSeoTitle(meta.seoTitle);
    if (meta?.seoDesc) setSeoDesc(meta.seoDesc);
    if (meta?.seoKeywords) setSeoKeywords(meta.seoKeywords);
    if (meta?.suggestedSlug && !slug) setSlug(meta.suggestedSlug);
    if (meta?.suggestedTitle && !excerpt) setExcerpt(meta.seoDesc ?? "");
    setTab("write");
  }

  function toggleTag(s: string) {
    setSelectedTags((t) => t.includes(s) ? t.filter((x) => x !== s) : [...t, s]);
  }

  async function addNewTag() {
    const s = slugify(newTag.trim());
    if (!s) return;
    const res = await fetch("/api/admin/blog/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTag.trim(), slug: s }) });
    if (res.ok) { setSelectedTags((t) => [...t, s]); setNewTag(""); router.refresh(); }
  }

  async function save(status: "DRAFT" | "PUBLISHED") {
    if (!title || !slug || !categoryId) { setError("Title, slug, and category are required."); return; }
    setBusy(true); setError("");
    const payload = { title, slug, excerpt, body, coverImage, categoryId, tagSlugs: selectedTags, status, seoTitle: seoTitle || title, seoDesc: seoDesc || excerpt, seoKeywords };
    const res = post
      ? await fetch(`/api/admin/blog/posts/${post.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/blog/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error saving post."); return; }
    router.push("/admin/blog");
    router.refresh();
  }

  const topCats = categories.filter((c) => !c.parentId);
  const childCats = categories.filter((c) => c.parentId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {/* ── Left ── */}
      <div className="grid gap-4">
        {/* Tab switcher */}
        <div className="flex gap-2 rounded-xl border border-white/10 bg-[#111315] p-1.5">
          <button type="button" onClick={() => setTab("write")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${tab === "write" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>
            <FileText size={14} /> Write Manually
          </button>
          <button type="button" onClick={() => setTab("ai")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${tab === "ai" ? "bg-red-600/20 text-red-400" : "text-white/40 hover:text-white"}`}>
            <Sparkles size={14} /> Generate with AI
          </button>
        </div>

        {tab === "ai" ? (
          <AiPanel onApply={applyAI} />
        ) : (
          <>
            {/* Title + Slug + Excerpt */}
            <div className="rounded-xl border border-white/10 bg-[#111315] p-5 grid gap-4">
              <div>
                <label className="label">Title</label>
                <input className="input text-base font-semibold" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Article title…" />
              </div>
              <div>
                <label className="label">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs text-white/30">/blog/</span>
                  <input className="input font-mono text-sm" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="article-url-slug" />
                </div>
              </div>
              <div>
                <label className="label">Excerpt</label>
                <textarea className="input min-h-[72px] resize-y" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary for listing pages and meta description…" />
              </div>
            </div>

            {/* Cover image */}
            <CoverImageInput value={coverImage} onChange={setCoverImage} />

            {/* Rich editor */}
            <div>
              <label className="label mb-2">Body</label>
              <RichEditor value={body} onChange={setBody} placeholder="Start writing your article… or switch to AI tab to generate →" />
            </div>

            {/* SEO */}
            <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/30">SEO Settings</h3>
              <div className="grid gap-4">
                <div>
                  <label className="label">SEO Title</label>
                  <input className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || "SEO optimized title…"} />
                  <p className="mt-1 text-right text-xs text-white/20">{seoTitle.length}/60</p>
                </div>
                <div>
                  <label className="label">Meta Description</label>
                  <textarea className="input min-h-[72px] resize-none" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder={excerpt || "Meta description…"} />
                  <p className="mt-1 text-right text-xs text-white/20">{seoDesc.length}/160</p>
                </div>
                <div>
                  <label className="label">Keywords</label>
                  <input className="input" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="welding parts, MIG welder, industrial sourcing…" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <div className="grid gap-4 self-start">
        {/* Publish */}
        <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/30">Publish</h3>
          {error && <p className="mb-3 rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-2 text-xs text-red-400">{error}</p>}
          <div className="grid gap-2">
            <button type="button" onClick={() => save("PUBLISHED")} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
              <Send size={14} /> {busy ? "Saving…" : "Publish"}
            </button>
            <button type="button" onClick={() => save("DRAFT")} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 disabled:opacity-50 transition-colors">
              <Save size={14} /> Save as Draft
            </button>
            {post?.status === "PUBLISHED" && (
              <a href={`/blog/${slug}`} target="_blank" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 transition-colors">
                <Eye size={14} /> View Post
              </a>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-white/30">Category</h3>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— Select —</option>
            {topCats.map((c) => (
              <optgroup key={c.id} label={c.name}>
                <option value={c.id}>{c.name}</option>
                {childCats.filter((x) => x.parentId === c.id).map((x) => (
                  <option key={x.id} value={x.id}>↳ {x.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-white/30">Tags</h3>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button key={tag.slug} type="button" onClick={() => toggleTag(tag.slug)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${selectedTags.includes(tag.slug) ? "border-red-600/40 bg-red-600/15 text-red-400" : "border-white/10 text-white/40 hover:text-white"}`}>
                {selectedTags.includes(tag.slug) && <X size={9} className="mr-1 inline" />}{tag.name}
              </button>
            ))}
            {allTags.length === 0 && <p className="text-xs text-white/25">No tags yet.</p>}
          </div>
          <div className="flex gap-2">
            <input className="input py-1.5 text-sm" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNewTag()} placeholder="New tag…" />
            <button type="button" onClick={addNewTag} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/50 hover:bg-white/10 hover:text-white transition-colors"><Plus size={12} /></button>
          </div>
        </div>

        {/* Timestamps */}
        {post && (
          <div className="rounded-xl border border-white/10 bg-[#111315] p-5 text-xs text-white/30 grid gap-1">
            <div>Created: {new Date(post.createdAt).toLocaleString("en")}</div>
            <div>Updated: {new Date(post.updatedAt).toLocaleString("en")}</div>
            {post.publishedAt && <div>Published: {new Date(post.publishedAt).toLocaleString("en")}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
