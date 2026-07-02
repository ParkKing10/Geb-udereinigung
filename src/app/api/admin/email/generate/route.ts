import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { composeEmail, type ComposeInput } from "@/lib/email/generate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySession(store.get(AUTH_COOKIE)?.value))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as ComposeInput | null;
  if (!body?.prompt?.trim()) return NextResponse.json({ error: "Bitte Stichpunkte / Inhalt eingeben." }, { status: 400 });
  const result = await composeEmail(body);
  return NextResponse.json(result);
}
