import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { readExpenses, addExpense, deleteExpense, EXPENSE_CATEGORIES, type ExpenseCategory, type ExpenseCadence } from "@/lib/admin/expenses";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  return hasNavAccess("/admin/betriebskosten");
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readExpenses());
}

export async function POST(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const label = String(b?.label ?? "").trim();
  const amountEuro = Number(b?.amountEuro);
  const category = String(b?.category ?? "") as ExpenseCategory;
  const cadence = (b?.cadence === "einmalig" ? "einmalig" : "monatlich") as ExpenseCadence;
  if (!label || !Number.isFinite(amountEuro) || amountEuro < 0) return NextResponse.json({ error: "Bezeichnung und Betrag sind erforderlich." }, { status: 400 });
  if (!EXPENSE_CATEGORIES.includes(category)) return NextResponse.json({ error: "Ungültige Kategorie." }, { status: 400 });
  const exp = await addExpense({ label, category, amountCents: Math.round(amountEuro * 100), cadence, date: b?.date ? String(b.date) : undefined });
  return NextResponse.json(exp);
}

export async function DELETE(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!b?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  await deleteExpense(b.id);
  return NextResponse.json({ ok: true });
}
