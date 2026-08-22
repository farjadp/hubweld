import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PostEditor from "../PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const [cats, tags] = await Promise.all([
    (prisma as any).postCategory.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).postTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-7 flex items-center gap-4">
        <Link href="/admin/blog" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">New Post</h1>
          <p className="text-sm text-slate-500">Create a new blog article</p>
        </div>
      </div>
      <PostEditor categories={cats} allTags={tags} />
    </div>
  );
}
