import { TRUST_SEALS } from "@/lib/sauberfit-data";
import { Icon } from "./Icon";

export function TrustLogos() {
  return (
    <div className="sf-container sf-trust">
      <div className="sf-trust-card">
        <p className="sf-trust-label">Geprüft, versichert &amp; zertifiziert – Ihre Sicherheit</p>
        <div className="sf-seals">
          {TRUST_SEALS.map((s) => (
            <div className="sf-seal" key={s.label}>
              <span className="sf-seal-ic"><Icon name={s.icon} size={20} /></span>
              <span className="sf-seal-t">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
