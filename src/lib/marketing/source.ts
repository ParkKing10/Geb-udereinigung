// Ableitung der Traffic-Quelle aus Attribution (gclid/utm/referrer) – gemeinsam für Sessions & Leads.
export type SourceInfo = { key: string; label: string; emoji: string };

export type SourceInput = {
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  msclkid?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  referrer?: string | null; // volle URL, Host oder ""
};

function host(ref: string): string {
  return ref.replace(/^https?:\/\//, "").split("/")[0];
}

export function deriveSource(a: SourceInput): SourceInfo {
  const paidGoogle = !!(a.gclid || a.gbraid || a.wbraid);
  const us = (a.utm_source || "").toLowerCase();
  const um = (a.utm_medium || "").toLowerCase();
  const h = host((a.referrer || "").toLowerCase()) || us;
  const isPaidMedium = um.includes("cpc") || um.includes("ppc") || um.includes("paid");
  // Referrer, die eindeutig aus Google Ads stammen (Display-Safeframe, DoubleClick-
  // Ad-Server, Suchpartner-Netzwerk) – auch ohne gclid als Google Ads werten.
  const googleAdsRef = /googlesyndication\.com|doubleclick\.net|syndicatedsearch\.goog/.test(h);

  if (paidGoogle || googleAdsRef || (us.includes("google") && isPaidMedium)) return { key: "google_ads", label: "Google Ads", emoji: "🔵" };
  if (a.msclkid || (us.includes("bing") && isPaidMedium)) return { key: "bing_ads", label: "Bing Ads", emoji: "🔵" };
  if (/chatgpt|openai/.test(h)) return { key: "chatgpt", label: "ChatGPT", emoji: "🤖" };
  if (/perplexity/.test(h)) return { key: "perplexity", label: "Perplexity", emoji: "🤖" };
  if (/gemini|bard/.test(h)) return { key: "gemini", label: "Gemini", emoji: "🤖" };
  if (/google\./.test(h) || us === "google") return { key: "organic_google", label: "Organic Google", emoji: "🟢" };
  if (/bing\./.test(h) || us === "bing") return { key: "organic_bing", label: "Organic Bing", emoji: "🟢" };
  if (/duckduckgo/.test(h)) return { key: "organic_duckduckgo", label: "Organic DuckDuckGo", emoji: "🟢" };
  if (/yahoo/.test(h)) return { key: "organic_yahoo", label: "Organic Yahoo", emoji: "🟢" };
  if (/ecosia/.test(h)) return { key: "organic_ecosia", label: "Organic Ecosia", emoji: "🟢" };
  if (/instagram/.test(h) || us.includes("instagram")) return { key: "instagram", label: "Instagram", emoji: "🟣" };
  if (/facebook|fb\.com|fb\.me/.test(h) || us.includes("facebook")) return { key: "facebook", label: "Facebook", emoji: "🟣" };
  if (/linkedin/.test(h) || us.includes("linkedin")) return { key: "linkedin", label: "LinkedIn", emoji: "🟣" };
  if (h) return { key: `ref:${h}`, label: h, emoji: "🟣" };
  if (us) return { key: us, label: a.utm_source || us, emoji: "🟣" };
  return { key: "direct", label: "Direct", emoji: "⚫" };
}
