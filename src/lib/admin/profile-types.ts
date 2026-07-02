// Client-sichere Typen fürs Admin-Profil (KEIN node:crypto/fs – darf in Client-Komponenten).
export type TwoFactor = {
  enabled: boolean;
  secret?: string; // base32 (nur serverseitig)
  backupCodes?: string[]; // sha256-Hashes (nur serverseitig)
};

export type AdminProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string; // /uploads/admin/...
  passwordHash?: string; // scrypt$salt$hash (nur serverseitig)
  twoFactor: TwoFactor;
  loginAlerts: boolean;
  updatedAt?: string;
};

// Ansicht fürs Frontend – ohne Geheimnisse.
export type SafeProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  hasCustomPassword: boolean;
  loginAlerts: boolean;
};

export function initials(firstName: string, lastName: string): string {
  const a = firstName.trim()[0] ?? "";
  const b = lastName.trim()[0] ?? "";
  return (a + b).toUpperCase() || "A";
}
