import { Icon } from "./Icon";
import { STEPS } from "@/lib/sauberfit-data";

export function Ablauf() {
  return (
    <section className="sf-section alt">
      <div className="sf-container">
        <div className="sf-head">
          <h2>In 3 Schritten zur sauberen Lösung</h2>
          <p>Unkompliziert starten – vom ersten Kontakt bis zum ersten Einsatz.</p>
        </div>
        <div className="sf-steps">
          {STEPS.map((s) => (
            <div className="sf-step" key={s.n}>
              <span className="sf-step-n">{s.n}</span>
              <span className="sf-step-ic"><Icon name={s.icon} size={26} /></span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
