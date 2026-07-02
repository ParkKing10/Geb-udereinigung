// Datei-basierter Store für KI-generierte SEO-Blogartikel + Auto-Konfiguration.
import { promises as fs } from "node:fs";
import { dataPath, readSeededJson } from "@/lib/data-dir";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  keyword: string;
  excerpt: string;
  contentHtml: string;
  faq: { q: string; a: string }[];
  status: "scheduled" | "published";
  publishDate: string; // YYYY-MM-DD
  createdAt: string; // ISO
  author: string;
  generatedBy: "ai" | "heuristik";
};

export type BlogConfig = {
  active: boolean;
  frequencyDays: number; // 1 = täglich, 2, 3, 7 …
  topics: string[]; // Keyword-/Themen-Pool, rotiert
  startedAt?: string;
  lastRun?: string;
};

export const DEFAULT_CONFIG: BlogConfig = {
  active: false,
  frequencyDays: 2,
  topics: [
    "Büroreinigung Kosten pro m²",
    "Unterhaltsreinigung Ablauf und Vorteile",
    "Glasreinigung Büro wie oft",
    "Treppenhausreinigung Pflichten Hausverwaltung",
    "Praxisreinigung Hygienestandards",
    "Industriereinigung Anforderungen",
    "Grundreinigung vs. Unterhaltsreinigung Unterschied",
    "Reinigungsfirma wechseln worauf achten",
  ],
};

const POSTS = "blog-posts.json";
const CONFIG = "blog-config.json";

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    // Seed-Fallback: liest die im Repo mitgelieferte Kopie, falls die Disk noch leer ist.
    return await readSeededJson<T>(file);
  } catch {
    return fallback;
  }
}
async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.writeFile(dataPath(file), JSON.stringify(data, null, 2), "utf8");
}

export async function readPosts(): Promise<BlogPost[]> {
  const p = await readJson<BlogPost[]>(POSTS, []);
  return Array.isArray(p) ? p : [];
}
export async function savePost(post: BlogPost): Promise<void> {
  const posts = await readPosts();
  posts.push(post);
  await writeJson(POSTS, posts);
}
export async function getPost(slug: string): Promise<BlogPost | null> {
  return (await readPosts()).find((p) => p.slug === slug) ?? null;
}
export async function publishedPosts(): Promise<BlogPost[]> {
  const today = new Date().toISOString().slice(0, 10);
  return (await readPosts())
    .filter((p) => p.status === "published" || p.publishDate <= today)
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));
}

export async function readConfig(): Promise<BlogConfig> {
  return { ...DEFAULT_CONFIG, ...(await readJson<Partial<BlogConfig>>(CONFIG, {})) };
}
export async function saveConfig(patch: Partial<BlogConfig>): Promise<BlogConfig> {
  const next = { ...(await readConfig()), ...patch };
  await writeJson(CONFIG, next);
  return next;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}
