import { NextResponse } from "next/server";
import { createSession, AUTH_COOKIE, SESSION_MAX_AGE } from "@/lib/admin/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = body?.password ? String(body.password) : "";
  // In Produktion darf nicht auf das Default-Passwort "admin" zurückgefallen werden.
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Server nicht konfiguriert (ADMIN_PASSWORD fehlt)." }, { status: 500 });
  }
  const expected = process.env.ADMIN_PASSWORD || "admin";

  if (!password || password !== expected) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const token = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
