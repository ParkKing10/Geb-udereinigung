import { readSafeAccounts, readSignatures, readMessages } from "@/lib/email/store";
import { EmailClient } from "@/components/admin/EmailClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "E-Mails – Deutsche Gebäudedienste" };

export default async function EmailAdminPage() {
  const [accounts, signatures, messages] = await Promise.all([readSafeAccounts(), readSignatures(), readMessages()]);
  return <EmailClient initialAccounts={accounts} initialSignatures={signatures} initialMessages={messages} />;
}
