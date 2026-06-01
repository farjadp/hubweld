import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import PostEditor from "../../PostEditor";
import DeletePostButton from "./DeletePostButton";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const [post, cats, tags] = await Promise.all([
    (prisma as any).post.findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } }, category: true },
    }),
    (prisma as any).postCategory.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).postTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Edit Post</h1>
            <p className="text-sm text-white/40">{post.title}</p>
          </div>
        </div>
        <DeletePostButton id={post.id} />
      </div>
      <PostEditor categories={cats} allTags={tags} post={post} />
    </div>
  );
}
