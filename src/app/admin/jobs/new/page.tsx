import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNewJobForm from "./AdminNewJobForm";

export const dynamic = "force-dynamic";

export default async function AdminNewJobPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/jobs" className="text-slate-500 hover:text-slate-900 text-sm">← Jobs</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-black tracking-tight">New Job</h1>
      </div>
      {customers.length === 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          No customers found. <Link href="/admin/users/new" className="underline">Create a customer account first</Link>.
        </div>
      )}
      <AdminNewJobForm customers={customers} />
    </div>
  );
}
