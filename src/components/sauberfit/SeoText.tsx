// SEO-Textblock, der auf jeder Unterseite kurz vor dem Footer steht.
// Liefert eindeutigen, themenspezifischen Fließtext (kein Thin-/Duplicate-Content).
export function SeoText({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}) {
  return (
    <section className="sf-seotext" aria-label="Weitere Informationen">
      <div className="sf-container">
        <h2>{title}</h2>
        <div className="sf-seotext-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
