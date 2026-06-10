import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AdminProductForm from "../../AdminProductForm";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect("/login");
  if (me.role !== "ADMIN") redirect("/dashboard");

  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.productCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "SUPPLIER" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-white/40 hover:text-white text-sm">← Products</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-black tracking-tight line-clamp-1">Edit: {product.name}</h1>
      </div>
      <AdminProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        suppliers={suppliers}
        initial={{
          name: product.name, brand: product.brand, sku: product.sku,
          slug: product.slug, categoryId: product.categoryId,
          priceCents: product.priceCents, stock: product.stock,
          imageUrl: product.imageUrl, description: product.description,
          status: product.status, featured: product.featured,
          supplierId: product.supplierId,
        }}
      />
    </div>
  );
}
