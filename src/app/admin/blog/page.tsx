import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, FolderOpen, Tag, Eye, EyeOff, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const [posts, cats, tags] = await Promise.all([
    (prisma as any).post.findMany({
      include: { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    (prisma as any).postCategory.count(),
    (prisma as any).postTag.count(),
  ]);

  const published = posts.filter((p: any) => p.status === "PUBLISHED").length;
  const drafts = posts.filter((p: any) => p.status === "DRAFT").length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Blog</h1>
          <p className="mt-1 text-sm text-white/40">Manage posts, categories, and tags</p>
        </div>
        <Link href="/admin/blog/posts/new" className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition-colors">
          <Plus size={15} /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Posts", value: posts.length, icon: FileText, color: "text-white" },
          { label: "Published", value: published, icon: Eye, color: "text-green-400" },
          { label: "Drafts", value: drafts, icon: EyeOff, color: "text-amber-400" },
          { label: "Categories", value: cats, icon: FolderOpen, color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#111315] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/30">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin/blog/categories" className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111315] px-4 py-2 text-sm text-white/60 hover:border-white/20 hover:text-white transition-colors">
          <FolderOpen size={14} /> Manage Categories
        </Link>
        <Link href="/admin/blog/tags" className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111315] px-4 py-2 text-sm text-white/60 hover:border-white/20 hover:text-white transition-colors">
          <Tag size={14} /> Manage Tags
        </Link>
      </div>

      {/* Posts table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="border-b border-white/5 bg-[#0d0f11] px-5 py-3">
          <span className="text-xs font-black uppercase tracking-widest text-white/30">All Posts</span>
        </div>
        {posts.length === 0 ? (
          <div className="p-10 text-center text-sm text-white/30">No posts yet. <Link href="/admin/blog/posts/new" className="text-red-400 hover:underline">Create your first post →</Link></div>
        ) : (
          <ul className="divide-y divide-white/5">
            {posts.map((p: any) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${p.status === "PUBLISHED" ? "border-green-600/30 bg-green-600/10 text-green-400" : "border-amber-600/30 bg-amber-600/10 text-amber-400"}`}>
                      {p.status}
                    </span>
                    <span className="font-semibold text-white">{p.title}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-white/30">
                    <span>{p.category.name}</span>
                    <span>{p.author.name}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}</span>
                    {p.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag size={9} />
                        {p.tags.map((t: any) => t.tag.name).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.status === "PUBLISHED" && (
                    <Link href={`/blog/${p.slug}`} target="_blank" className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors">
                      <Eye size={12} /> View
                    </Link>
                  )}
                  <Link href={`/admin/blog/posts/${p.id}/edit`} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors">
                    <Pencil size={12} /> Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
