import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AdminUserEditForm from "./AdminUserEditForm";

export const dynamic = "force-dynamic";

export default async function AdminEditUserPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { welderProfile: true, supplierProfile: true },
  });
  if (!user) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/users" className="text-slate-500 hover:text-slate-900 text-sm">← Users</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-black tracking-tight">Edit: {user.name}</h1>
      </div>
      <AdminUserEditForm
        userId={user.id}
        initial={{
          name: user.name,
          email: user.email,
          city: user.city ?? "",
          role: user.role,
          welderProfile: user.welderProfile ? {
            bio: user.welderProfile.bio,
            skills: user.welderProfile.skills,
            certifications: user.welderProfile.certifications,
            serviceArea: user.welderProfile.serviceArea,
            hourlyRate: user.welderProfile.hourlyRate ?? 0,
            yearsExp: user.welderProfile.yearsExp ?? 0,
          } : null,
        }}
      />
    </div>
  );
}
