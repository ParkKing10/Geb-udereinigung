import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { readInvoiceSettings, saveInvoiceSettings, type InvoiceSettings } from "@/lib/admin/invoices";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  return hasNavAccess("/admin/invoices");
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readInvoiceSettings());
}

export async function POST(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const patch = (await req.json().catch(() => null)) as Partial<InvoiceSettings> | null;
  if (!patch) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  return NextResponse.json(await saveInvoiceSettings(patch));
}
