import { PageHeader } from "@/components/admin/ui";
import { UsersClient } from "@/components/admin/UsersClient";
import { listUsers } from "@/lib/admin/users";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await listUsers();
  return (
    <>
      <PageHeader
        title="Benutzer"
        subtitle="Mitarbeiter-Zugänge fürs Admin – mit frei wählbaren Menü-Rechten pro Person"
      />
      <UsersClient users={users} />
    </>
  );
}
