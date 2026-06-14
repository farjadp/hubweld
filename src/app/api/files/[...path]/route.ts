import { NextRequest, NextResponse } from "next/server";
import { readUpload, contentTypeFor } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const name = params.path.join("/");
  // Prevent path traversal
  if (name.includes("..") || name.includes("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const buffer = await readUpload(name);
  if (!buffer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": contentTypeFor(name),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
