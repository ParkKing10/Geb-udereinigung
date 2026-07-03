import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getActor, can, navKeyForPath } from "@/lib/admin/actor";
import { readSafeProfile } from "@/lib/admin/profile";
import { initials } from "@/lib/admin/profile-types";
import { ADMIN_NAV } from "@/lib/admin/nav";

export const metadata: Metadata = {
  title: "Admin – Deutsche Gebäudedienste",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  // Middleware hat nur die Signatur geprüft – hier fliegen deaktivierte/gelöschte
  // Mitarbeiter sofort raus (frische Daten aus users.json).
  if (!actor) redirect("/login");

  // Seiten-Rechte durchsetzen (Pfad kommt aus der Middleware).
  const path = (await headers()).get("x-admin-path") || "/admin";
  if (!can(actor, navKeyForPath(path))) redirect("/admin");

  // Menü nach Rechten filtern.
  const allowedHrefs = ADMIN_NAV.filter((i) => can(actor, i.href)).map((i) => i.href);

  const user =
    actor.kind === "owner"
      ? await (async () => {
          const p = await readSafeProfile();
          return {
            name: `${p.firstName} ${p.lastName}`.trim() || "Administrator",
            role: "Administrator",
            initials: initials(p.firstName, p.lastName),
            avatar: p.avatar,
          };
        })()
      : {
          name: actor.name,
          role: "Mitarbeiter",
          initials: actor.name.split(/\s+/).map((s) => s[0] ?? "").join("").slice(0, 2).toUpperCase() || "MA",
          avatar: undefined,
        };

  return <AdminShell user={user} allowedHrefs={allowedHrefs}>{children}</AdminShell>;
}
