// Server-seitige Leser für die datei-basierten Stores (leads.json / contacts.json).
import { promises as fs } from "node:fs";
import { dataPath, uploadPath } from "@/lib/data-dir";
import type { Lead, Message, Order } from "./data";
import { currentAccountKey } from "./actor";
import { OWNER_KEY } from "./scope";

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(dataPath(file), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function readLeads(): Promise<Lead[]> {
  const leads = await readJson<Lead>("leads.json");
  return leads.slice().reverse(); // neueste zuerst
}

export async function readMessages(): Promise<Message[]> {
  const msgs = await readJson<Message>("contacts.json");
  return msgs.slice().reverse();
}

export async function readSessions<T = unknown>(): Promise<T[]> {
  return readJson<T>("sessions.json");
}

export async function readOrders(): Promise<Order[]> {
  return readJson<Order>("orders.json");
}

export async function getOrder(id: string): Promise<Order | null> {
  return (await readJson<Order>("orders.json")).find((o) => o.id === id) ?? null;
}

type NewOrder = Omit<Order, "id" | "createdAt" | "repeat" | "orderIndex">;

// Buchung anlegen – dedupliziert den Kunden per E-Mail (→ repeat + orderIndex).
export async function createOrder(input: NewOrder): Promise<Order> {
  const p = dataPath("orders.json");
  const orders = await readJson<Order>("orders.json");
  const email = input.customerEmail.trim().toLowerCase();
  const owner = input.ownerId ?? (await currentAccountKey()) ?? OWNER_KEY;
  // Wiederbesteller-Zähler nur innerhalb desselben Accounts (Mandanten-Trennung).
  const prior = orders.filter((o) => (o.ownerId || OWNER_KEY) === owner && o.customerEmail.trim().toLowerCase() === email).length;
  const order: Order = {
    ...input,
    ownerId: owner,
    customerEmail: email,
    id: `ord_${Date.now()}`,
    createdAt: new Date().toISOString(),
    repeat: prior > 0,
    orderIndex: prior + 1,
  };
  orders.push(order);
  await fs.writeFile(p, JSON.stringify(orders, null, 2), "utf8");
  return order;
}

export async function getLead(id: string): Promise<Lead | null> {
  const leads = await readJson<Lead>("leads.json");
  return leads.find((l) => l.id === id) ?? null;
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<Lead | null> {
  const p = dataPath("leads.json");
  let leads: Lead[] = [];
  try {
    leads = JSON.parse(await fs.readFile(p, "utf8"));
  } catch {
    return null;
  }
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...patch };
  await fs.writeFile(p, JSON.stringify(leads, null, 2), "utf8");
  return leads[idx];
}

// Lead löschen (inkl. hochgeladener Kundenfotos → DSGVO-Hygiene). true, wenn entfernt.
export async function deleteLead(id: string): Promise<boolean> {
  const p = dataPath("leads.json");
  let leads: Lead[] = [];
  try { leads = JSON.parse(await fs.readFile(p, "utf8")); } catch { return false; }
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  await fs.writeFile(p, JSON.stringify(next, null, 2), "utf8");
  await fs.rm(uploadPath("leads", id), { recursive: true, force: true }).catch(() => {});
  return true;
}

// Auftrag löschen. true, wenn entfernt.
export async function deleteOrder(id: string): Promise<boolean> {
  const p = dataPath("orders.json");
  let orders: Order[] = [];
  try { orders = JSON.parse(await fs.readFile(p, "utf8")); } catch { return false; }
  const next = orders.filter((o) => o.id !== id);
  if (next.length === orders.length) return false;
  await fs.writeFile(p, JSON.stringify(next, null, 2), "utf8");
  return true;
}
