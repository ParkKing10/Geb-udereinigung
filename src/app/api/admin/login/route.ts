import { NextResponse } from "next/server";
import { createSession, AUTH_COOKIE, SESSION_MAX_AGE } from "@/lib/admin/auth";
import { verifyAdminPassword, isLoginConfigured, is2faEnabled, verifySecondFactor, readProfile } from "@/lib/admin/profile";
import { verifyUser } from "@/lib/admin/users";
import { readAccounts } from "@/lib/email/store";
import { sendMail } from "@/lib/email/send";

export const runtime = "nodejs";

// Login-Benachrichtigung per E-Mail (falls aktiviert + Standard-Postfach vorhanden).
// Fire-and-forget: ein Mailfehler darf den Login nie blockieren.
async function sendLoginAlert(req: Request) {
  try {
    const profile = await readProfile();
    if (!profile.loginAlerts || !profile.email) return;
    const accounts = await readAccounts();
    const acc = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!acc?.smtpHost) return;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unbekannt";
    const ua = req.headers.get("user-agent") || "unbekannt";
    const when = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
    await sendMail(acc, {
      to: profile.email,
      subject: "Neue Anmeldung im Admin-Bereich",
      html: `<p>Es hat sich gerade jemand im Admin-Bereich angemeldet.</p>
             <p><strong>Zeit:</strong> ${when}<br><strong>IP:</strong> ${ip}<br><strong>Gerät:</strong> ${ua}</p>
             <p>Waren Sie das nicht, ändern Sie umgehend Ihr Passwort.</p>`,
    });
  } catch {
    /* Mailfehler ignorieren */
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = body?.password ? String(body.password) : "";
  const code = body?.code ? String(body.code) : "";
  const email = body?.email ? String(body.email).trim() : "";

  // Mitarbeiter-Login (E-Mail + Passwort, Rechte aus users.json; ohne 2FA).
  if (email) {
    const user = await verifyUser(email, password);
    if (!user) return NextResponse.json({ error: "E-Mail oder Passwort falsch." }, { status: 401 });
    const token = await createSession(`user:${user.id}`);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    void sendLoginAlert(req);
    return res;
  }

  if (!(await isLoginConfigured())) {
    return NextResponse.json({ error: "Server nicht konfiguriert (ADMIN_PASSWORD fehlt)." }, { status: 500 });
  }

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  // Zweiter Faktor, falls aktiviert.
  if (await is2faEnabled()) {
    if (!code) {
      return NextResponse.json({ need2fa: true, error: "Bitte den 6-stelligen Code aus deiner Authenticator-App eingeben." }, { status: 401 });
    }
    if (!(await verifySecondFactor(code))) {
      return NextResponse.json({ need2fa: true, error: "Code ungültig. Alternativ einen Backup-Code eingeben." }, { status: 401 });
    }
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

  void sendLoginAlert(req);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
