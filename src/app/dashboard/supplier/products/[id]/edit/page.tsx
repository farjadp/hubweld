import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/dashboard/supplier/products/${params.id}/edit`);
  const me = session.user as any;
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") redirect("/dashboard");

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();
  if (product.supplierId !== me.id && me.role !== "ADMIN") redirect("/dashboard/supplier/products");

  const categories = await prisma.productCategory.findMany({
    where: { parentId: { not: null } },
    include: { parent: true },
    orderBy: [{ parent: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-black tracking-tight">Edit product</h1>
      <p className="mb-6 text-white/60">Update listing details, pricing, and stock.</p>
      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories.map((c) => ({ id: c.id, name: `${c.parent?.name} → ${c.name}` }))}
        initial={{
          name: product.name, brand: product.brand, sku: product.sku, slug: product.slug,
          categoryId: product.categoryId, priceCents: product.priceCents, stock: product.stock,
          imageUrl: product.imageUrl, description: product.description, status: product.status,
          featured: product.featured,
        }}
      />
    </div>
  );
}
