import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import "./sauberfit.css";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Gebäudereinigung deutschlandweit – Deutsche Gebäudedienste",
    template: "%s | Deutsche Gebäudedienste",
  },
  description:
    "Deutsche Gebäudedienste – Ihr Partner für professionelle Reinigung deutschlandweit: Büro-, Hotel-, Praxis- & Industriereinigung zum fairen Festpreis.",
  openGraph: { type: "website", locale: "de_DE", siteName: "Deutsche Gebäudedienste", images: ["/images/sf-hero.jpg"] },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
