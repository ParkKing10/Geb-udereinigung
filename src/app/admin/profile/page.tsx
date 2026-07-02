import { PageHeader } from "@/components/admin/ui";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { readSafeProfile } from "@/lib/admin/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await readSafeProfile();
  return (
    <>
      <PageHeader
        title="Profil"
        subtitle="Persönliche Daten, Passwort und Sicherheitseinstellungen verwalten"
      />

      <div className="max-w-3xl">
        <ProfileForm initial={profile} />
      </div>
    </>
  );
}
