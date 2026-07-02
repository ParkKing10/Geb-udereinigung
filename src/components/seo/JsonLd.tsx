export function JsonLd({ data }: { data: object | object[] }) {
  // JSON.stringify escapes quotes/control chars but not "<" — an interpolated value
  // (e.g. AI-generated blog title/description) containing "</script" could otherwise
  // prematurely close this tag and break the page's HTML parsing.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
