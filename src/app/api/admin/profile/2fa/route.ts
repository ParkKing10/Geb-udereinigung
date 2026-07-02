import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { begin2faSetup, enable2fa, disable2fa } from "@/lib/admin/profile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySession(store.get(AUTH_COOKIE)?.value))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const op = body?.op;

  if (op === "setup") {
    // Neues Secret + otpauth-URL (noch nicht aktiv, bis mit Code bestätigt).
    return NextResponse.json(await begin2faSetup());
  }

  if (op === "enable") {
    const res = await enable2fa(String(body?.secret ?? ""), String(body?.code ?? ""));
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true, backupCodes: res.backupCodes });
  }

  if (op === "disable") {
    const res = await disable2fa(String(body?.proof ?? ""));
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
