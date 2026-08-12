import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CartProvider } from "@/lib/CartContext";

import { Fraunces, Manrope } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ny-erin-ny-boky.com"), // ⚠️ mets ton vrai domaine ici
  title: {
    default: `${SITE_NAME} — Tsena boky Malagasy`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Marketplace de vente et de location de livres à Madagascar. Achetez et louez des livres en ligne : business, développement personnel, romans, boky malagasy et plus.",
  keywords: ["livre", "boky", "book", "librairie Madagascar", "location livre", "achat livre en ligne", "tsena boky"],
  icons: {
    icon: "/logo-ny-herin-ny-boky.png",
  },
  openGraph: {
    title: `${SITE_NAME} — Tsena boky Malagasy`,
    description: "Marketplace de vente et de location de livres à Madagascar",
    locale: "fr_MG",
    type: "website",
    siteName: SITE_NAME,
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          <LanguageProvider>
            <LoadingScreen />
            {children}
          </LanguageProvider>
        </CartProvider>
      </body>
    </html>
  );
}