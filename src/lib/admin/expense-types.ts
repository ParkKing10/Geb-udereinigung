// Client-sichere Betriebskosten-Typen + Kategorien + reiner Kennzahlen-Helfer (KEIN node:fs).
export const EXPENSE_CATEGORIES = [
  "Personal",
  "Material & Reinigungsmittel",
  "Fahrzeuge & Sprit",
  "Miete & Lager",
  "Versicherung",
  "Marketing & Werbung",
  "Software & Gebühren",
  "Sonstiges",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type ExpenseCadence = "monatlich" | "einmalig";

export type Expense = {
  id: string;
  ownerId?: string; // Mandanten-Trennung: welcher Account hat die Ausgabe angelegt
  label: string;
  category: ExpenseCategory;
  amountCents: number;
  cadence: ExpenseCadence;
  date: string;
  createdAt: string;
};

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Kennzahlen: monatliche Fixkosten (cadence=monatlich) + einmalige des laufenden Monats.
export function expenseSummary(expenses: Expense[], now = new Date()) {
  const monthlyFixed = expenses.filter((e) => e.cadence === "monatlich").reduce((a, e) => a + e.amountCents, 0);
  const oneOffThisMonth = expenses
    .filter((e) => e.cadence === "einmalig" && sameMonth(new Date(e.date), now))
    .reduce((a, e) => a + e.amountCents, 0);
  const byCategory = new Map<string, number>();
  for (const e of expenses.filter((x) => x.cadence === "monatlich")) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amountCents);
  }
  return {
    monthlyFixed,
    oneOffThisMonth,
    monthlyTotal: monthlyFixed + oneOffThisMonth,
    annualFixed: monthlyFixed * 12,
    byCategory: Array.from(byCategory.entries()).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
  };
}
