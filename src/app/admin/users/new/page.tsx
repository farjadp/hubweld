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
        <Link href="/admin/users" className="text-white/40 hover:text-white text-sm">← Users</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-black tracking-tight">New User</h1>
      </div>
      <AdminNewUserForm />
    </div>
  );
}
