import { JsonLd } from "@/components/seo/JsonLd";
import { faqPage } from "@/lib/seo";

export function Faq({
  items,
  heading = "Häufige Fragen",
}: {
  items: { q: string; a: string }[];
  heading?: string;
}) {
  return (
    <section className="sf-section alt">
      <div className="sf-container">
        <div className="sf-head">
          <h2>{heading}</h2>
        </div>
        <div className="sf-faq">
          {items.map((it, i) => (
            <details key={i} open={i === 0}>
              <summary>{it.q}</summary>
              <div className="sf-faq-body">{it.a}</div>
            </details>
          ))}
        </div>
      </div>
      <JsonLd data={faqPage(items)} />
    </section>
  );
}
