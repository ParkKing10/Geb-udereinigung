import { X, Check } from "lucide-react";
import { PAINS, SOLUTIONS } from "@/lib/sauberfit-data";

export function ProblemSolution() {
  return (
    <section className="sf-section">
      <div className="sf-container">
        <div className="sf-head">
          <h2>Kommt Ihnen das bekannt vor?</h2>
          <p>Die typischen Probleme mit Reinigungsfirmen – und wie wir es anders machen.</p>
        </div>
        <div className="sf-ps-grid">
          <div className="sf-ps-card problem">
            <span className="sf-ps-label">Das nervt bei anderen</span>
            <ul>
              {PAINS.map((p) => (
                <li key={p}><span className="sf-ps-ic x"><X size={15} /></span> {p}</li>
              ))}
            </ul>
          </div>
          <div className="sf-ps-card solution">
            <span className="sf-ps-label">So arbeiten wir</span>
            <ul>
              {SOLUTIONS.map((s) => (
                <li key={s}><span className="sf-ps-ic c"><Check size={15} /></span> {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
