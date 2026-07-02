import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin – Deutsche Gebäudedienste",
  robots: { index: false, follow: false },
};

const USER = { name: "Sara Ahmadi", role: "Administratorin", initials: "SA" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell user={USER}>{children}</AdminShell>;
}
