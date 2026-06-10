import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminProductForm from "../AdminProductForm";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect("/login?callbackUrl=/admin/products/new");
  if (me.role !== "ADMIN") redirect("/dashboard");

  const [categories, suppliers] = await Promise.all([
    prisma.productCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "SUPPLIER" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-white/40 hover:text-white text-sm">← Products</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-black tracking-tight">New Product</h1>
      </div>
      {suppliers.length === 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          No approved suppliers yet. <Link href="/admin/suppliers" className="underline">Approve a supplier first</Link> so you can assign ownership.
        </div>
      )}
      <AdminProductForm mode="create" categories={categories} suppliers={suppliers} />
    </div>
  );
}
