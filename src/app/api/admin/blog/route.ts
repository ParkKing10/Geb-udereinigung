import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { readPosts, readConfig, saveConfig, savePost, type BlogConfig } from "@/lib/blog/store";
import { generateBlog } from "@/lib/blog/generate";

export const runtime = "nodejs";
export const maxDuration = 90;

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(AUTH_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const [posts, config] = await Promise.all([readPosts(), readConfig()]);
  return NextResponse.json({ posts, config });
}

// Artikel jetzt generieren (manuell / "New Article").
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const config = await readConfig();
  const keyword = String(b.keyword || "").trim() || config.topics[Math.floor(Math.random() * Math.max(1, config.topics.length))] || "Gebäudereinigung Tipps";
  const publishDate = String(b.publishDate || "").trim() || new Date().toISOString().slice(0, 10);
  const post = await generateBlog(keyword, publishDate);
  await savePost(post);
  revalidatePath("/ratgeber");
  revalidatePath(`/ratgeber/${post.slug}`);
  return NextResponse.json({ ok: true, post });
}

// Auto-Konfiguration ändern (Frequenz, Themen, aktiv/pausiert).
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Partial<BlogConfig>;
  const patch: Partial<BlogConfig> = {};
  if (typeof b.active === "boolean") { patch.active = b.active; if (b.active) patch.startedAt = new Date().toISOString(); }
  if (typeof b.frequencyDays === "number" && b.frequencyDays > 0) patch.frequencyDays = Math.round(b.frequencyDays);
  if (Array.isArray(b.topics)) patch.topics = b.topics.map((t) => String(t).trim()).filter(Boolean);
  const config = await saveConfig(patch);
  return NextResponse.json({ ok: true, config });
}
