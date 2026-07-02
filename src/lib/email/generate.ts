// KI-Verfassen von E-Mails (Anthropic) – aus Stichpunkten wird eine fertige Mail.
// Ohne Key: solider Heuristik-Fallback, damit die Funktion immer nutzbar ist.
import { anthropicConfig } from "@/lib/admin/app-settings";

export type ComposeInput = {
  prompt: string; // Stichpunkte / grobe Idee des Nutzers
  tone?: string; // z. B. "freundlich", "förmlich", "kurz"
  mode?: "new" | "reply";
  recipient?: string; // Name/Adresse des Empfängers
  original?: string; // bei Antwort: Originaltext
};

export type ComposeDraft = { subject: string; bodyHtml: string };

const SYSTEM =
  'Du bist die persönliche E-Mail-Assistenz von "Deutsche Gebäudedienste", einer deutschlandweiten Gebäudereinigungsfirma. ' +
  "Formuliere aus Stichpunkten professionelle, natürliche deutsche Geschäfts-E-Mails: klar, höflich, auf den Punkt, ohne Floskeln. " +
  "Keine Signatur/Grußformel-Block am Ende mit Name/Firma (die wird separat angehängt) – aber eine passende Grußzeile wie 'Mit freundlichen Grüßen' ist ok.";

function userPrompt(input: ComposeInput): string {
  const parts = [
    `Aufgabe: Schreibe eine ${input.mode === "reply" ? "Antwort-E-Mail" : "E-Mail"} auf Deutsch.`,
    input.recipient ? `Empfänger: ${input.recipient}.` : "",
    input.tone ? `Tonfall: ${input.tone}.` : "Tonfall: freundlich und professionell.",
    input.original ? `\nDas ist die E-Mail, auf die geantwortet wird:\n"""\n${input.original.slice(0, 2000)}\n"""` : "",
    `\nStichpunkte / Inhalt vom Nutzer:\n"""\n${input.prompt}\n"""`,
    `\nAntworte AUSSCHLIESSLICH als reines JSON (kein Markdown): {"subject":"Betreff","bodyHtml":"<p>Absatz</p><p>Absatz</p>"}`,
    `Der Body ist einfaches HTML mit <p>-Absätzen (optional <ul><li>). Kein <html>/<body>-Tag. Halte es angemessen kurz.`,
  ];
  return parts.filter(Boolean).join("\n");
}

async function aiDraft(input: ComposeInput): Promise<ComposeDraft | null> {
  const { key, model } = await anthropicConfig();
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 1500, system: SYSTEM, messages: [{ role: "user", content: userPrompt(input) }] }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { text?: string }[] };
    let text = data.content?.[0]?.text?.trim() ?? "";
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(text) as ComposeDraft;
    if (!parsed.subject || !parsed.bodyHtml) return null;
    return parsed;
  } catch {
    return null;
  }
}

function heuristicDraft(input: ComposeInput): ComposeDraft {
  const raw = input.prompt.trim();
  const firstLine = raw.split(/\n|\.|;/)[0]?.trim() || "Ihre Anfrage";
  const subject = input.mode === "reply" ? `Re: ${firstLine.slice(0, 60)}` : firstLine.slice(0, 60);
  // Stichpunkte → Absätze.
  const bullets = raw.split(/\n+/).map((l) => l.replace(/^[-*•\s]+/, "").trim()).filter(Boolean);
  const body = bullets.length > 1
    ? `<p>Guten Tag${input.recipient ? " " + escapeHtml(input.recipient) : ""},</p><p>vielen Dank für Ihre Nachricht.</p><ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul><p>Für Rückfragen stehen wir Ihnen jederzeit gern zur Verfügung.</p><p>Mit freundlichen Grüßen</p>`
    : `<p>Guten Tag${input.recipient ? " " + escapeHtml(input.recipient) : ""},</p><p>${escapeHtml(raw)}</p><p>Für Rückfragen stehen wir Ihnen jederzeit gern zur Verfügung.</p><p>Mit freundlichen Grüßen</p>`;
  return { subject, bodyHtml: body };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function composeEmail(input: ComposeInput): Promise<{ draft: ComposeDraft; source: "ai" | "heuristik" }> {
  const ai = await aiDraft(input);
  if (ai) return { draft: ai, source: "ai" };
  return { draft: heuristicDraft(input), source: "heuristik" };
}
