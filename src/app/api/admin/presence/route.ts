import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { presenceSnapshot } from "@/lib/presence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Live-Besucher fürs Dashboard (anonyme Daten → für alle eingeloggten Nutzer okay).
export async function GET() {
  const store = await cookies();
  if (!(await verifySession(store.get(AUTH_COOKIE)?.value))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const now = Date.now();
  const visitors = presenceSnapshot().map((v) => ({
    sid: v.sid.slice(0, 8),
    path: v.path,
    seconds: Math.max(0, Math.round((now - v.firstSeen) / 1000)),
    quote: v.quote,
  }));
  return NextResponse.json({
    count: visitors.length,
    inQuote: visitors.filter((v) => v.quote?.open).length,
    visitors,
  });
}
