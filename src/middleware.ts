import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, AUTH_COOKIE } from "@/lib/admin/auth";

export const config = { matcher: ["/admin", "/admin/:path*"] };

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (await verifySession(token)) {
    // Pfad ans Server-Layout durchreichen – dort werden die Menü-Rechte
    // (Mitarbeiter-Benutzer) mit frischen Daten aus users.json geprüft.
    const headers = new Headers(req.headers);
    headers.set("x-admin-path", req.nextUrl.pathname);
    return NextResponse.next({ request: { headers } });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}
