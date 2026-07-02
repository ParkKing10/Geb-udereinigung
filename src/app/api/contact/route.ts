import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "contacts.json");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const message = body?.message?.trim();
  const phone = body?.phone?.trim() || null;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Bitte Name, E-Mail und Nachricht angeben." },
      { status: 400 },
    );
  }

  const entry = { id: `msg_${Date.now()}`, name, email, phone, message, createdAt: new Date().toISOString() };
  try {
    let list: unknown[] = [];
    try { list = JSON.parse(await fs.readFile(FILE, "utf8")); } catch { list = []; }
    list.push(entry);
    await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.error("Kontakt konnte nicht gespeichert werden:", err);
  }
  console.log("📨 Neue Kontaktanfrage:", entry);
  return NextResponse.json({ ok: true });
}
