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
  title: `${SITE_NAME} — Tsena boky Malagasy`,
  description: "marketplace de vente et de location des livres à Madagascar",
  icons: {
    icon: "/logo-ny-herin-ny-boky.png",
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
