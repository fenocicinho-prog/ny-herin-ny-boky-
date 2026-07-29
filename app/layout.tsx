import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Tsena boky Malagasy`,
  description:
    "Plateforme malagasy de vente et location de livres — mividy sy mihiratra boky",
  icons: {
    icon: "/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mg">
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          <LoadingScreen />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
