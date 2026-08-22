import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNewUserForm from "./AdminNewUserForm";

export const dynamic = "force-dynamic";

export default async function AdminNewUserPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/users" className="text-slate-500 hover:text-slate-900 text-sm">← Users</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-black tracking-tight">New User</h1>
      </div>
      <AdminNewUserForm />
    </div>
  );
}
