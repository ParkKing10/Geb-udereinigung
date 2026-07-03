import { appendJourneyEvent } from "@/lib/journeys";

export const runtime = "nodejs";

const CLIENT_TYPES = new Set(["view", "quote_open", "quote_step"]);

// Öffentlicher Journey-Beacon: Seitenaufrufe + Formular-Schritte je Session.
// "contact" und "submit" werden ausschließlich serverseitig protokolliert.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sid = typeof body?.sid === "string" ? body.sid : "";
  const t = typeof body?.t === "string" ? body.t : "";
  if (!/^[a-f0-9-]{8,40}$/i.test(sid) || !CLIENT_TYPES.has(t)) return new Response(null, { status: 204 });

  let p: string | undefined;
  if (typeof body.p === "string") {
    const v = body.p.trim().slice(0, 200);
    if (t === "view" && v.startsWith("/")) p = v;
    if (t === "quote_step" && /^[1-3]$/.test(v)) p = v;
  }

  await appendJourneyEvent({ sid, t: t as "view" | "quote_open" | "quote_step", p });
  return new Response(null, { status: 204 });
}
