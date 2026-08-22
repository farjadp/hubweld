import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserRow from "./UserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");
  const users = await prisma.user.findMany({ include: { welderProfile: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">{users.length} registered users</p>
        </div>
        <Link href="/admin/users/new" className="btn-primary shrink-0">+ New User</Link>
      </div>
      <div className="grid gap-2">
        {users.map((u) => <UserRow key={u.id} user={{ id: u.id, name: u.name, email: u.email, role: u.role, banned: u.banned, approved: u.welderProfile?.approved ?? null }} />)}
        {users.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">No users yet.</div>}
      </div>
    </div>
  );
}
