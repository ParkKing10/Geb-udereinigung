import { upsertAbandoned } from "@/lib/admin/abandoned";
import { appendJourneyEvent } from "@/lib/journeys";

export const runtime = "nodejs";

const S = (v: unknown, max = 120): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, max);
  return t || undefined;
};

// Öffentlich: speichert eine angefangene, nicht abgeschickte Anfrage.
// Wird nur gesendet, wenn der Besucher E-Mail ODER Handynummer eingetippt hat
// (siehe LeadProvider) – serverseitig nochmal erzwungen.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sid = typeof body?.sid === "string" ? body.sid : "";
  if (!/^[a-f0-9-]{8,40}$/i.test(sid)) return new Response(null, { status: 204 });

  const email = S(body.email, 160);
  const phone = S(body.phone, 60);
  const hasEmail = !!email && /\S+@\S+\.\S+/.test(email);
  const hasPhone = !!phone && phone.replace(/\D/g, "").length >= 6;
  if (!hasEmail && !hasPhone) return new Response(null, { status: 204 });

  // Attribution begrenzen (max. 8 Schlüssel, kurze Werte).
  let attribution: Record<string, string> | undefined;
  if (body.attribution && typeof body.attribution === "object") {
    attribution = {};
    for (const [k, v] of Object.entries(body.attribution as Record<string, unknown>).slice(0, 8)) {
      if (typeof v === "string" && v.trim() && /^[a-z_]{2,20}$/i.test(k)) attribution[k] = v.trim().slice(0, 300);
    }
    if (!Object.keys(attribution).length) attribution = undefined;
  }

  const created = await upsertAbandoned(sid, {
    step: Math.min(2, Math.max(0, Number(body.step) || 0)),
    service: S(body.service),
    location: S(body.location),
    objektart: S(body.objektart),
    areaSqm: S(body.areaSqm, 20),
    turnus: S(body.turnus),
    firma: S(body.firma),
    name: S(body.name),
    email: hasEmail ? email : undefined,
    phone: hasPhone ? phone : undefined,
    attribution,
  });
  if (created) await appendJourneyEvent({ sid, t: "contact" });
  return new Response(null, { status: 204 });
}
