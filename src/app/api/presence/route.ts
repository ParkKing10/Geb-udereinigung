import { updatePresence, setPresenceCompany, presenceSnapshot, type QuoteState } from "@/lib/presence";
import { deriveSource } from "@/lib/marketing/source";
import { lookupCompany } from "@/lib/company-lookup";

export const runtime = "nodejs";

const S = (v: unknown, max = 200): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, max);
  return t || undefined;
};

// Öffentlicher Besucher-Beacon (alle ~15 s + bei Formular-Änderungen).
// Anonym: Session-ID, Pfad, Formular-Fortschritt + Herkunft (Referrer/UTM, keine Klick-IDs).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sid = typeof body?.sid === "string" ? body.sid : "";
  const path = typeof body?.path === "string" ? body.path : "";
  if (!/^[a-f0-9-]{8,40}$/i.test(sid) || !path.startsWith("/") || path.length > 200) {
    return new Response(null, { status: 204 });
  }
  let quote: QuoteState | null = null;
  const q = body?.quote;
  if (q && typeof q === "object") {
    quote = {
      open: !!q.open,
      step: Math.min(2, Math.max(0, Number(q.step) || 0)),
      hasContact: !!q.hasContact,
    };
  }

  // Herkunft ableiten (Google Ads / Google / Bing / Social / Referral / Direct).
  const t = body?.touch && typeof body.touch === "object" ? body.touch : {};
  const src = deriveSource({
    gclid: S(t.gclid, 120),
    gbraid: S(t.gbraid, 120),
    wbraid: S(t.wbraid, 120),
    utm_source: S(t.utm_source, 100),
    utm_medium: S(t.utm_medium, 100),
    referrer: S(t.referrer, 200),
  });

  // Technik: IP (erster Hop) + Land (Cloudflare-Header). Bleibt nur im flüchtigen
  // Presence-Speicher (max. 45 s nach letztem Beacon) – wird nirgends persistiert.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 45) || undefined;
  const countryRaw = (req.headers.get("cf-ipcountry") ?? "").trim().toUpperCase();
  const country = /^[A-Z]{2}$/.test(countryRaw) && countryRaw !== "XX" ? countryRaw : undefined;
  const device = body?.device === "mobile" ? "mobile" as const : body?.device === "desktop" ? "desktop" as const : undefined;

  updatePresence(sid, path, quote, { label: src.label, emoji: src.emoji, keyword: S(t.utm_term, 100) }, { ip, country, device });

  // Firmen-Erkennung asynchron nachziehen (blockiert den Beacon nicht; gecacht).
  if (ip && presenceSnapshot().find((v) => v.sid === sid)?.company === undefined) {
    void lookupCompany(ip)
      .then((company) => setPresenceCompany(sid, company))
      .catch(() => {});
  }

  return new Response(null, { status: 204 });
}
