import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { saveUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];
const RESUME_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const RESUME_EXT = ["pdf", "doc", "docx"];

const MAX_IMAGE = 5 * 1024 * 1024;  // 5 MB
const MAX_RESUME = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  // Any signed-in user may upload an image: welders their avatar and gallery,
  // suppliers product photos, customers photos of the job site. Résumés are
  // welders only.

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const kind = (formData.get("kind") as string) || "image"; // avatar | gallery | resume | product | job
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (kind === "resume" && me.role !== "WELDER") {
    return NextResponse.json({ error: "Only welders upload a résumé" }, { status: 403 });
  }

  const isResume = kind === "resume";
  const allowedTypes = isResume ? RESUME_TYPES : IMAGE_TYPES;
  const allowedExt = isResume ? RESUME_EXT : IMAGE_EXT;
  const maxSize = isResume ? MAX_RESUME : MAX_IMAGE;

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: isResume ? "Resume must be PDF or Word." : "Image must be JPG, PNG, or WebP." }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json({ error: `File too large. Max ${Math.round(maxSize / 1024 / 1024)}MB.` }, { status: 400 });
  }

  const url = await saveUpload(file, allowedExt);
  return NextResponse.json({ url });
}
