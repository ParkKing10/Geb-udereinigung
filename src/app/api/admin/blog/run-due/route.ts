import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { readPosts, readConfig, saveConfig, savePost } from "@/lib/blog/store";
import { generateBlog } from "@/lib/blog/generate";

export const runtime = "nodejs";
export const maxDuration = 120;

// Wird per Cron aufgerufen (z. B. Vercel Cron täglich) ODER manuell im Admin.
// Auth: Admin-Cookie ODER ?secret=<CRON_SECRET>.
async function authorized(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET;
  if (secret && url.searchParams.get("secret") === secret) return true;
  const store = await cookies();
  return verifySession(store.get(AUTH_COOKIE)?.value);
}

const DAY = 86400000;

export async function POST(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const config = await readConfig();
  if (!config.active) return NextResponse.json({ ok: true, generated: 0, reason: "pausiert" });

  const posts = await readPosts();
  const today = new Date().toISOString().slice(0, 10);

  // Fällig, wenn seit dem letzten Artikel >= frequencyDays vergangen sind (oder noch keiner existiert).
  const last = posts.map((p) => p.publishDate).sort().at(-1);
  const daysSince = last ? Math.floor((Date.parse(today) - Date.parse(last)) / DAY) : Infinity;
  if (daysSince < config.frequencyDays) {
    return NextResponse.json({ ok: true, generated: 0, reason: `nächster Artikel in ${config.frequencyDays - daysSince} Tag(en)` });
  }

  const topics = config.topics.length ? config.topics : ["Gebäudereinigung Tipps"];
  const keyword = topics[posts.length % topics.length];
  const post = await generateBlog(keyword, today);
  await savePost(post);
  await saveConfig({ lastRun: new Date().toISOString() });
  revalidatePath("/ratgeber");
  revalidatePath(`/ratgeber/${post.slug}`);

  return NextResponse.json({ ok: true, generated: 1, post: { slug: post.slug, title: post.title } });
}
