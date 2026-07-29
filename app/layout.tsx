import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

//const geistSans = Geist({
// variable: "--font-geist-sans",
//  subsets: ["latin"],
//});

//const geistMono = Geist_Mono({
  // variable: "--font-geist-mono",
  // subsets: ["latin"],
// });

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
    <html
      lang="mg"
      //className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
