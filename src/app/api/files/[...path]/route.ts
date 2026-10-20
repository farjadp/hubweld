import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readUpload, contentTypeFor } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/** Documents are personal: a welder's CV is not public the way their photo is. */
const DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const name = params.path.join("/");
  // Prevent path traversal
  if (name.includes("..") || name.includes("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const contentType = contentTypeFor(name);

  // Images stay open — product shots and avatars are rendered on public pages
  // and have to be cacheable. Résumés are not: they carry a phone number, an
  // address and a work history, and were previously readable by anyone who
  // had the URL. Signing in is a low bar, but it is a bar.
  if (DOCUMENT_TYPES.includes(contentType)) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in to view this document" }, { status: 401 });
    }
  }

  const buffer = await readUpload(name);
  if (!buffer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isDocument = DOCUMENT_TYPES.includes(contentType);
  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": contentType,
      // Uploaded bytes must never be sniffed into something executable.
      "X-Content-Type-Options": "nosniff",
      // Filenames are random, so an immutable public cache is safe for images.
      // Documents are per-viewer, so they must not land in a shared cache.
      "Cache-Control": isDocument ? "private, max-age=0, must-revalidate" : "public, max-age=31536000, immutable",
    },
  });
}
