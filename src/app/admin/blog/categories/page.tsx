import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminBlogCategoriesPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const cats = await (prisma as any).postCategory.findMany({
    include: { children: true, _count: { select: { posts: true } } },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-7 flex items-center gap-4">
        <Link href="/admin/blog" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Blog Categories</h1>
          <p className="text-sm text-slate-500">Create parent and child categories</p>
        </div>
      </div>
      <CategoryManager initialCats={cats} />
    </div>
  );
}
