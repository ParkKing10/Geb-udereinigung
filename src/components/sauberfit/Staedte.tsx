import { MapPin } from "lucide-react";
import { STAEDTE } from "@/lib/sauberfit-data";

export function Staedte() {
  return (
    <section className="sf-section">
      <div className="sf-container">
        <div className="sf-head">
          <h2>Gebäudereinigung in ganz Deutschland</h2>
          <p>Bundesweit für Sie im Einsatz – mit eigener Standort-Seite für Ihre Stadt und den Umkreis.</p>
        </div>
        <div className="sf-stadtteile">
          {STAEDTE.map((s) => (
            <a key={s.slug} href={`/standorte/${s.slug}`} className="sf-stadtteil">
              <MapPin size={14} /> {s.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
