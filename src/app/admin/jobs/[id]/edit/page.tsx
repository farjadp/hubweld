import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AdminJobEditForm from "./AdminJobEditForm";

export const dynamic = "force-dynamic";

export default async function AdminEditJobPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { customer: true },
  });
  if (!job) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/jobs" className="text-slate-500 hover:text-slate-900 text-sm">← Jobs</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-black tracking-tight line-clamp-1">Edit: {job.title}</h1>
      </div>
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
        Posted by <span className="text-slate-900">{job.customer.name}</span> · {job.city} · {job.category}
      </div>
      <AdminJobEditForm
        jobId={job.id}
        initial={{
          title: job.title,
          description: job.description,
          city: job.city,
          category: job.category,
          budget: job.budget ?? 0,
          status: job.status,
        }}
      />
    </div>
  );
}
