import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserRow from "./UserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") redirect("/dashboard");
  const users = await prisma.user.findMany({ include: { welderProfile: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tight text-white">Users</h1>
        <p className="mt-1 text-sm text-white/40">{users.length} registered users</p>
      </div>
      <div className="grid gap-2">
        {users.map((u) => <UserRow key={u.id} user={{ id: u.id, name: u.name, email: u.email, role: u.role, banned: u.banned, approved: u.welderProfile?.approved ?? null }} />)}
        {users.length === 0 && <div className="rounded-xl border border-white/10 bg-[#111315] p-10 text-center text-sm text-white/30">No users yet.</div>}
      </div>
    </div>
  );
}
