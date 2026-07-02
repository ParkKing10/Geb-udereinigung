import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { readSafeProfile, saveProfileData, changePassword } from "@/lib/admin/profile";

export const runtime = "nodejs";

async function authed(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(AUTH_COOKIE)?.value);
}

export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readSafeProfile());
}

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });

  // Passwortwechsel (optional) – zuerst, damit bei falschem aktuellen Passwort nichts gespeichert wird.
  let passwordChanged = false;
  const newPw = typeof body.newPassword === "string" ? body.newPassword : "";
  if (newPw) {
    if (newPw !== body.confirmPassword) {
      return NextResponse.json({ error: "Die neuen Passwörter stimmen nicht überein." }, { status: 400 });
    }
    const res = await changePassword(String(body.currentPassword ?? ""), newPw);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
    passwordChanged = true;
  }

  const safe = await saveProfileData({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    loginAlerts: body.loginAlerts,
  });

  return NextResponse.json({ ok: true, passwordChanged, profile: safe });
}
