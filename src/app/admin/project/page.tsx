import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectBoard from "./ProjectBoard";

export const dynamic = "force-dynamic";

/**
 * The board itself is a client component, so it carried no server-side check:
 * every other /admin page redirects a non-admin away, this one rendered its
 * chrome to anyone signed in and only failed when the API refused the data.
 * This wrapper puts it back in line with the rest of the admin area.
 */
export default async function ProjectPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect("/login?callbackUrl=/admin/project");
  if (me.role !== "ADMIN") redirect("/dashboard");

  return <ProjectBoard />;
}
