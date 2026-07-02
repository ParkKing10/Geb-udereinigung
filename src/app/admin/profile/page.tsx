import { PageHeader } from "@/components/admin/ui";
import { ProfileForm } from "@/components/admin/ProfileForm";

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Persönliche Daten, Passwort und Sicherheitseinstellungen verwalten"
      />

      <div className="max-w-3xl">
        <ProfileForm />
      </div>
    </>
  );
}
