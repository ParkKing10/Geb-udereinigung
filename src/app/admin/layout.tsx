import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { readSafeProfile } from "@/lib/admin/profile";
import { initials } from "@/lib/admin/profile-types";

export const metadata: Metadata = {
  title: "Admin – Deutsche Gebäudedienste",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const p = await readSafeProfile();
  const user = {
    name: `${p.firstName} ${p.lastName}`.trim() || "Administrator",
    role: "Administrator",
    initials: initials(p.firstName, p.lastName),
    avatar: p.avatar,
  };
  return <AdminShell user={user}>{children}</AdminShell>;
}
