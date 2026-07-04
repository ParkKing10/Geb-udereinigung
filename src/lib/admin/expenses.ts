// Betriebskosten-Store (expenses.json). Beträge in Cent. Monatliche Fixkosten +
// einmalige Ausgaben. Typen + Kategorien + reiner Helfer liegen client-sicher in expense-types.ts.
import { promises as fs } from "node:fs";
import { dataPath } from "@/lib/data-dir";
import { randomUUID } from "node:crypto";
import { currentAccountKey } from "./actor";
import { OWNER_KEY } from "./scope";
import type { Expense, ExpenseCategory, ExpenseCadence } from "./expense-types";

export { EXPENSE_CATEGORIES, expenseSummary } from "./expense-types";
export type { Expense, ExpenseCategory, ExpenseCadence } from "./expense-types";

const FILE = "expenses.json";

async function readJson<T>(): Promise<T[]> {
  try {
    const raw = await fs.readFile(dataPath(FILE), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
async function writeJson(data: unknown): Promise<void> {
  await fs.writeFile(dataPath(FILE), JSON.stringify(data, null, 2), "utf8");
}

export async function readExpenses(): Promise<Expense[]> {
  return readJson<Expense>();
}

type NewExpense = { label: string; category: ExpenseCategory; amountCents: number; cadence: ExpenseCadence; date?: string };

export async function addExpense(input: NewExpense): Promise<Expense> {
  const list = await readExpenses();
  const now = new Date().toISOString();
  const exp: Expense = {
    id: `exp_${Date.now()}_${randomUUID().slice(0, 8)}`,
    ownerId: (await currentAccountKey()) ?? OWNER_KEY,
    label: input.label,
    category: input.category,
    amountCents: Math.round(input.amountCents),
    cadence: input.cadence,
    date: input.date || now,
    createdAt: now,
  };
  await writeJson([exp, ...list]);
  return exp;
}

export async function deleteExpense(id: string): Promise<void> {
  const list = await readExpenses();
  await writeJson(list.filter((e) => e.id !== id));
}
