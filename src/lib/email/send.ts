// E-Mail-Versand über das SMTP des jeweiligen Postfachs (nodemailer).
import nodemailer from "nodemailer";
import type { MailAccount, Signature } from "./store";

export type SendInput = {
  to: string;
  subject: string;
  html: string; // Nachrichtentext als HTML
  signature?: Signature | null;
};

function signatureHtml(sig: Signature): string {
  const photo = sig.photo
    ? `<td style="padding-right:12px;vertical-align:top"><img src="${sig.photo}" width="52" height="52" style="border-radius:999px;display:block" alt=""></td>`
    : "";
  const lines = [
    sig.displayName ? `<div style="font-weight:700;color:#16241a">${escapeHtml(sig.displayName)}</div>` : "",
    sig.role ? `<div style="color:#5d8a34;font-size:13px">${escapeHtml(sig.role)}</div>` : "",
    sig.html ? `<div style="color:#5b6357;font-size:13px;margin-top:4px">${sig.html}</div>` : "",
  ].filter(Boolean).join("");
  return `<table style="margin-top:20px;border-top:1px solid #e6e8e3;padding-top:12px;font-family:Arial,sans-serif"><tr>${photo}<td style="vertical-align:top">${lines}</td></tr></table>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildBody(html: string, signature?: Signature | null): { html: string; text: string } {
  const full = signature ? `${html}${signatureHtml(signature)}` : html;
  // Grober Text-Fallback (Tags entfernen) für reine Text-Clients.
  const text = full.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|tr|table)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return { html: full, text };
}

export async function sendMail(account: MailAccount, input: SendInput): Promise<{ messageId: string; html: string; text: string }> {
  if (!account.smtpHost || !account.smtpUser) {
    throw new Error("Kein SMTP für dieses Postfach konfiguriert. Bitte in den Postfach-Einstellungen SMTP-Server, Benutzer und Passwort hinterlegen.");
  }
  const { html, text } = buildBody(input.html, input.signature);
  const transport = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecure,
    auth: { user: account.smtpUser, pass: account.smtpPass },
  });
  const info = await transport.sendMail({
    from: `"${account.fromName || account.label}" <${account.address}>`,
    to: input.to,
    subject: input.subject,
    text,
    html,
  });
  return { messageId: info.messageId, html, text };
}
