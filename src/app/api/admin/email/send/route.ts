import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { getAccount, getSignature, addMessage } from "@/lib/email/store";
import { sendMail, buildBody } from "@/lib/email/send";

export const runtime = "nodejs";

type SendBody = { accountId?: string; to?: string; subject?: string; html?: string; signatureId?: string | null };

export async function POST(req: Request) {
  if (!(await hasNavAccess("/admin/email"))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as SendBody | null;
  if (!body?.accountId || !body?.to?.trim() || !body?.subject?.trim()) {
    return NextResponse.json({ error: "Absender, Empfänger und Betreff sind erforderlich." }, { status: 400 });
  }
  const account = await getAccount(body.accountId);
  if (!account) return NextResponse.json({ error: "Postfach nicht gefunden." }, { status: 404 });

  const signature = body.signatureId ? (await getSignature(body.signatureId)) ?? null : null;
  const htmlIn = body.html ?? "";

  try {
    const { html } = await sendMail(account, { to: body.to, subject: body.subject, html: htmlIn, signature });
    const msg = await addMessage({
      accountId: account.id,
      folder: "sent",
      direction: "out",
      fromName: account.fromName,
      from: account.address,
      to: body.to,
      subject: body.subject,
      text: "",
      html,
      date: new Date().toISOString(),
      read: true,
      status: "sent",
    });
    return NextResponse.json({ ok: true, message: msg });
  } catch (e) {
    // Fehlgeschlagen → in den Ausgang legen (mit Fehlertext), damit nichts verloren geht.
    const { html } = buildBody(htmlIn, signature);
    const msg = await addMessage({
      accountId: account.id,
      folder: "outbox",
      direction: "out",
      fromName: account.fromName,
      from: account.address,
      to: body.to,
      subject: body.subject,
      text: "",
      html,
      date: new Date().toISOString(),
      read: true,
      status: "failed",
      error: e instanceof Error ? e.message : "Versand fehlgeschlagen",
    });
    return NextResponse.json({ ok: false, error: msg.error, message: msg }, { status: 502 });
  }
}
