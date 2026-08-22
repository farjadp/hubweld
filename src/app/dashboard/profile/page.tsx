import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

function parseGallery(json?: string | null): string[] {
  if (!json) return [];
  try { const a = JSON.parse(json); return Array.isArray(a) ? a.filter((x) => typeof x === "string") : []; }
  catch { return []; }
}
function splitList(s?: string | null): string[] {
  return (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/profile");
  const me = session.user as any;
  if (me.role !== "WELDER") redirect("/dashboard");
  const profile = await prisma.welderProfile.findUnique({ where: { userId: me.id } });
  const approved = profile?.approved ?? false;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-black tracking-tight">Welder profile</h1>
      <p className="mb-4 text-slate-600">Help customers find you. Verified profiles appear higher in the directory.</p>

      {/* A welder previously had no way to tell whether they were verified. */}
      <div
        className={`mb-6 rounded-sm border px-4 py-3 text-sm ${
          approved
            ? "border-green-600/30 bg-green-50 text-green-800"
            : "border-amber-500/40 bg-amber-50 text-amber-900"
        }`}
      >
        {approved ? (
          <>
            <strong>Verified.</strong> Your profile carries the verified badge and is ranked above unverified
            welders in the directory.
          </>
        ) : (
          <>
            <strong>Not yet verified.</strong> You still appear in the directory and can bid on jobs. Complete
            your profile — certifications, service area and a resume carry the most weight — then contact an
            admin to request verification.
          </>
        )}
      </div>
      <ProfileForm initial={{
        bio: profile?.bio ?? "",
        skills: profile?.skills ?? "",
        certifications: profile?.certifications ?? "",
        serviceArea: profile?.serviceArea ?? "",
        hourlyRate: profile?.hourlyRate ?? null,
        yearsExp: profile?.yearsExp ?? null,
        avatarUrl: profile?.avatarUrl ?? "",
        resumeUrl: profile?.resumeUrl ?? "",
        gallery: parseGallery(profile?.galleryJson),
        languages: splitList(profile?.languages),
        country: profile?.country ?? "",
        serviceCountries: splitList(profile?.serviceCountries),
      }} />
    </div>
  );
}
