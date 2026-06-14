import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";

// On Railway, set UPLOAD_DIR=/app/data/uploads (persistent volume).
// Locally it defaults to public/uploads so files are served statically in dev.
export function uploadDir(): string {
  return process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");
}

// Public URL for an uploaded file. When UPLOAD_DIR is the default public path,
// files are served statically; otherwise they go through the /api/files route.
export function fileUrl(name: string): string {
  if (process.env.UPLOAD_DIR) return `/api/files/${name}`;
  return `/uploads/${name}`;
}

export async function saveUpload(file: File, allowedExt: string[]): Promise<string> {
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const safeExt = allowedExt.includes(ext) ? ext : allowedExt[0];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, name), buffer);
  return fileUrl(name);
}

export async function readUpload(name: string): Promise<Buffer | null> {
  try {
    return await readFile(join(uploadDir(), name));
  } catch {
    return null;
  }
}

export async function deleteUpload(url: string): Promise<void> {
  // url could be /api/files/<name> or /uploads/<name>
  const name = url.split("/").pop();
  if (!name) return;
  try { await unlink(join(uploadDir(), name)); } catch { /* ignore */ }
}

export function contentTypeFor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg": case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    case "gif": return "image/gif";
    case "pdf": return "application/pdf";
    case "doc": return "application/msword";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default: return "application/octet-stream";
  }
}
