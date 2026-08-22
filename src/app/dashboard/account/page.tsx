import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountForm from "./AccountForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account settings" };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/account");
  const me = session.user as any;

  const user = await prisma.user.findUnique({
    where: { id: me.id },
    include: { supplierProfile: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Account settings</h1>
      <p className="mt-2 text-slate-600">
        Your sign-in details and contact information.
        {user.role === "WELDER" && (
          <>
            {" "}
            Your public welding profile lives on the{" "}
            <Link href="/dashboard/profile" className="text-brand underline underline-offset-2">
              welder profile page
            </Link>
            .
          </>
        )}
      </p>

      <div className="seam my-6" aria-hidden />

      <AccountForm
        role={user.role}
        email={user.email}
        name={user.name}
        city={user.city ?? ""}
        phone={user.phone ?? ""}
        supplier={
          user.supplierProfile
            ? {
                businessName: user.supplierProfile.businessName,
                description: user.supplierProfile.description,
                website: user.supplierProfile.website,
              }
            : null
        }
      />
    </div>
  );
}
