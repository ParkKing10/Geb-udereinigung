import type { MetadataRoute } from "next";
import { SERVICES, TARGETS, COMPANY_PAGES, STAEDTE, SITE } from "@/lib/sauberfit-data";
import { publishedPosts } from "@/lib/blog/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/leistungen`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/fuer-wen`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/standorte`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/preise`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  for (const c of COMPANY_PAGES) {
    entries.push({ url: `${base}${c.href}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const s of SERVICES) {
    entries.push({ url: `${base}/leistungen/${s.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.9 });
  }
  for (const t of TARGETS) {
    entries.push({ url: `${base}/fuer-wen/${t.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
  }
  for (const s of STAEDTE) {
    entries.push({ url: `${base}/standorte/${s.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  const posts = await publishedPosts();
  for (const p of posts) {
    entries.push({ url: `${base}/ratgeber/${p.slug}`, lastModified: new Date(p.createdAt), changeFrequency: "monthly", priority: 0.6 });
  }

  return entries;
}
