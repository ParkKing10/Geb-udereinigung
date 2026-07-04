import { readSafeAccounts, readSignatures, readMessages } from "@/lib/email/store";
import { isOwnerAccount } from "@/lib/admin/scope";
import { EmailClient } from "@/components/admin/EmailClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "E-Mails – Deutsche Gebäudedienste" };

export default async function EmailAdminPage() {
  const [accounts, signatures, messagesRaw, owner] = await Promise.all([readSafeAccounts(), readSignatures(), readMessages(), isOwnerAccount()]);
  const messages = owner ? messagesRaw : []; // eingehende Kontaktnachrichten (Website) nur für den Inhaber
  return <EmailClient initialAccounts={accounts} initialSignatures={signatures} initialMessages={messages} />;
}
