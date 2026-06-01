import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/supplier/products/new");
  const me = session.user as any;
  if (me.role !== "SUPPLIER" && me.role !== "ADMIN") redirect("/dashboard");

  const categories = await prisma.productCategory.findMany({
    where: { parentId: { not: null } },
    include: { parent: true },
    orderBy: [{ parent: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-black tracking-tight">New product</h1>
      <p className="mb-6 text-white/60">List a new item on the HubWeld marketplace.</p>
      <ProductForm
        mode="create"
        categories={categories.map((c) => ({ id: c.id, name: `${c.parent?.name} → ${c.name}` }))}
      />
    </div>
  );
}
