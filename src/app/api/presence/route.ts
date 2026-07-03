import { updatePresence, type QuoteState } from "@/lib/presence";

export const runtime = "nodejs";

// Öffentlicher Besucher-Beacon (alle ~15 s + bei Formular-Änderungen).
// Bewusst anonym: nur Session-ID, Pfad und Formular-Fortschritt – keine PII.
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
  updatePresence(sid, path, quote);
  return new Response(null, { status: 204 });
}
