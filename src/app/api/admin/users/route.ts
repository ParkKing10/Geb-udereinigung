import { NextResponse } from "next/server";
import { guardNav } from "@/lib/admin/actor";
import { listUsers, createUser, updateUser, deleteUser } from "@/lib/admin/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Benutzerverwaltung – ausschließlich für den Inhaber.
export async function GET() {
  const g = await guardNav("owner");
  if (g) return g;
  return NextResponse.json(await listUsers());
}

export async function POST(req: Request) {
  const g = await guardNav("owner");
  if (g) return g;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });

  const op = String(body.op ?? "create");

  if (op === "create") {
    const res = await createUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      perms: Array.isArray(body.perms) ? body.perms.map(String) : [],
    });
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true, user: res.user });
  }

  if (op === "update") {
    const res = await updateUser(String(body.id ?? ""), {
      name: body.name !== undefined ? String(body.name) : undefined,
      perms: Array.isArray(body.perms) ? body.perms.map(String) : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
      password: body.password ? String(body.password) : undefined,
    });
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true, user: res.user });
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const g = await guardNav("owner");
  if (g) return g;
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const ok = await deleteUser(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
}
