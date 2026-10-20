import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, forbidden } from "@/lib/admin-guard";
import { saveUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/**
 * Image upload for the blog editor.
 *
 * Three things were wrong here and all three bit in production:
 *  - the extension came straight off the uploaded filename, so an admin could
 *    write a .html or .svg into a statically served directory;
 *  - there was no size cap at all, unlike every other upload route;
 *  - the destination was hard-coded to public/uploads, which ignores
 *    UPLOAD_DIR — so on Railway every blog image vanished on the next deploy.
 *
 * saveUpload() handles all three: it picks the extension from an allowlist and
 * writes to the configured upload directory (the persistent volume in prod).
 */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_IMAGE = 5 * 1024 * 1024; // 5 MB, matching the welder image limit

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Image must be JPG, PNG, WebP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE) {
    return NextResponse.json({ error: `File too large. Max ${MAX_IMAGE / 1024 / 1024}MB.` }, { status: 400 });
  }

  const url = await saveUpload(file, IMAGE_EXT);
  return NextResponse.json({ url });
}
