// KI-Generierung SEO-optimierter Blogartikel (Anthropic). Ohne Key: Heuristik-Fallback.
import { slugify, type BlogPost } from "./store";
import { anthropicConfig } from "@/lib/admin/app-settings";

type Draft = {
  title: string;
  metaDescription: string;
  excerpt: string;
  sections: { h2: string; paragraphs: string[] }[];
  faq: { q: string; a: string }[];
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const SYSTEM =
  'Du bist SEO-Redakteur für "Deutsche Gebäudedienste", eine deutschlandweite Gebäudereinigungsfirma (Festpreis, feste Teams, persönlicher Ansprechpartner). Schreibe hochwertige, hilfreiche, suchmaschinenoptimierte Ratgeber-Artikel auf Deutsch, die bei Google ranken und Leads erzeugen. Natürlich, konkret, ohne Floskeln.';

function userPrompt(keyword: string): string {
  return `Schreibe einen SEO-Ratgeber zum Keyword: "${keyword}".
Antworte AUSSCHLIESSLICH als reines JSON (kein Markdown, kein Codeblock) in dieser Struktur:
{"title":"H1 ~55-60 Zeichen, Keyword vorne","metaDescription":"120-155 Zeichen mit Keyword + Nutzen + CTA","excerpt":"1-2 Sätze Teaser","sections":[{"h2":"Überschrift","paragraphs":["Absatz","Absatz"]}],"faq":[{"q":"Frage","a":"Antwort"}]}
Regeln: 4-6 Sektionen, 3-4 FAQ. Keyword natürlich mehrfach. Konkrete Zahlen/Beispiele. Eine Sektion zu Vorteilen von Deutsche Gebäudedienste (Festpreis, feste Teams). Am Ende Call-to-Action zum kostenlosen Festpreis-Angebot.`;
}

async function aiDraft(keyword: string): Promise<Draft | null> {
  const { key, model } = await anthropicConfig();
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 3000, system: SYSTEM, messages: [{ role: "user", content: userPrompt(keyword) }] }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { text?: string }[] };
    let text = data.content?.[0]?.text?.trim() ?? "";
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(text) as Draft;
    if (!parsed.title || !Array.isArray(parsed.sections)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Fallback ohne API-Key: solider, keyword-optimierter Template-Artikel.
function heuristicDraft(keyword: string): Draft {
  const k = keyword.trim();
  const kc = k.charAt(0).toUpperCase() + k.slice(1);
  return {
    title: `${kc}: Ratgeber, Kosten & Tipps`,
    metaDescription: `${kc} – was zählt, worauf Sie achten sollten und wie Sie zum fairen Festpreis kommen. Jetzt kostenloses Angebot der Deutschen Gebäudedienste sichern.`,
    excerpt: `Alles Wichtige rund um „${k}" – kompakt erklärt, mit konkreten Tipps und transparenten Kosten.`,
    sections: [
      { h2: `Was bedeutet ${k}?`, paragraphs: [`${kc} umfasst alle Leistungen rund um eine professionelle, zuverlässige Gebäudereinigung. Entscheidend sind Umfang, Frequenz und ein klar kalkulierter Festpreis – ohne versteckte Kosten.`, `Als deutschlandweit tätiger Dienstleister stimmen die Deutschen Gebäudedienste ${k} genau auf Ihr Objekt ab.`] },
      { h2: `Worauf Sie bei ${k} achten sollten`, paragraphs: [`Achten Sie auf feste, geschulte Teams, dokumentierte Qualitätskontrollen und einen persönlichen Ansprechpartner. So bleibt die Qualität konstant und planbar.`, `Ein transparenter Festpreis statt Stundenlohn-Risiko schützt Sie vor Überraschungen.`] },
      { h2: `Kosten & Preisfaktoren`, paragraphs: [`Die Kosten hängen von Fläche, Verschmutzungsgrad, Turnus und Objektart ab. Ein individuelles Angebot ist daher genauer als jede Pauschale.`, `Mit dem Sofort-Angebot der Deutschen Gebäudedienste erhalten Sie in wenigen Minuten einen fairen Festpreis.`] },
      { h2: `Ihre Vorteile mit den Deutschen Gebäudediensten`, paragraphs: [`Feste Teams, Festpreisgarantie, versichert bis 10 Mio. €, deutschlandweit im Einsatz und ein persönlicher Objektleiter – so wird ${k} zuverlässig und stressfrei.`] },
    ],
    faq: [
      { q: `Was kostet ${k}?`, a: `Der Preis richtet sich nach Fläche, Frequenz und Objektart. Über unser kostenloses Angebot erhalten Sie einen transparenten Festpreis.` },
      { q: `Wie schnell ist ${k} möglich?`, a: `In der Regel kurzfristig – schildern Sie uns Ihr Anliegen, wir melden uns meist innerhalb von 30 Minuten.` },
      { q: `Sind die Deutschen Gebäudedienste deutschlandweit tätig?`, a: `Ja, wir betreuen Objekte in ganz Deutschland mit einheitlichen Qualitätsstandards.` },
    ],
  };
}

function buildHtml(d: Draft): string {
  const parts: string[] = [`<p class="lead">${esc(d.excerpt)}</p>`];
  for (const s of d.sections) {
    parts.push(`<h2>${esc(s.h2)}</h2>`);
    for (const p of s.paragraphs) parts.push(`<p>${esc(p)}</p>`);
  }
  if (d.faq.length) {
    parts.push(`<h2>Häufige Fragen</h2>`);
    for (const f of d.faq) parts.push(`<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`);
  }
  parts.push(`<p class="cta-note"><strong>Jetzt kostenloses Festpreis-Angebot sichern</strong> – in nur 60 Sekunden.</p>`);
  return parts.join("\n");
}

export async function generateBlog(keyword: string, publishDate: string): Promise<BlogPost> {
  const ai = await aiDraft(keyword);
  const d = ai ?? heuristicDraft(keyword);
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  return {
    id: `post_${Date.now()}`,
    slug: `${slugify(d.title || keyword)}-${Date.now().toString(36).slice(-4)}`,
    title: d.title,
    metaDescription: d.metaDescription,
    keyword,
    excerpt: d.excerpt,
    contentHtml: buildHtml(d),
    faq: d.faq || [],
    status: publishDate <= today ? "published" : "scheduled",
    publishDate,
    createdAt: now,
    author: "Redaktion Deutsche Gebäudedienste",
    generatedBy: ai ? "ai" : "heuristik",
  };
}
