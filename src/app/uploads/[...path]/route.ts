// Liefert hochgeladene Dateien (Kundenfotos, Logos, Team-, E-Mail-Bilder) aus.
// Nötig, weil die Uploads NICHT mehr unter /public liegen, sondern in DATA_DIR/uploads
// (auf Render eine persistente Disk). Next.js serviert /public nur statisch – Uploads
// zur Laufzeit müssen daher über diese Route ausgeliefert werden.
//
// URL-Schema bleibt unverändert: /uploads/<...>  (z. B. /uploads/leads/<id>/bild_1.jpg)
import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, uploadPath } from "@/lib/data-dir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;

  // Pfad-Traversal verhindern: der aufgelöste Pfad MUSS innerhalb von UPLOAD_DIR liegen.
  const base = path.resolve(UPLOAD_DIR);
  const target = path.resolve(uploadPath(...segments));
  if (target !== base && !target.startsWith(base + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const type = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(target);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
