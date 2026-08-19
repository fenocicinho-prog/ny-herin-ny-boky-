import { LanguageProvider } from "@/lib/LanguageContext";
export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-stone-50">
        <main>{children}</main>
      </div>
    </LanguageProvider>
  );
}   

