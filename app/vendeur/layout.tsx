// app/vendeur/layout.tsx
import { LanguageProvider } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getSessionUser } from "@/lib/auth"; // Si nécessaire pour passer l'user au header



export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  // Note: Si Header a besoin de l'user, il faut faire un peu de logique serveur ici
  // ou passer l'user via un composant client intermédiaire comme vu avant.
  
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-stone-50">
        {/* Header unique pour tout l'espace vendeur */}
        {/* Assurez-vous que Header n'est PAS aussi dans app/layout.tsx racine */}
        
        <div className="bg-white border-b px-4 py-2 flex justify-end">
        </div>

        <main>{children}</main>
      </div>
    </LanguageProvider>
  );
}   

