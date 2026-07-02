import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { getAccount, addInboundBatch } from "@/lib/email/store";
import { fetchInbox } from "@/lib/email/fetch";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySession(store.get(AUTH_COOKIE)?.value))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { accountId?: string } | null;
  if (!body?.accountId) return NextResponse.json({ error: "accountId fehlt" }, { status: 400 });
  const account = await getAccount(body.accountId);
  if (!account) return NextResponse.json({ error: "Postfach nicht gefunden." }, { status: 404 });

  try {
    const mails = await fetchInbox(account, 30);
    const added = await addInboundBatch(
      account.id,
      mails.map((m) => ({ uid: m.uid, fromName: m.fromName, from: m.from, to: m.to, subject: m.subject, text: m.text, html: m.html, date: m.date })),
    );
    return NextResponse.json({ ok: true, fetched: mails.length, added });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Abruf fehlgeschlagen" }, { status: 502 });
  }
}
