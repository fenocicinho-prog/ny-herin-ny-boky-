// app/vendeur/dashboard/layout.tsx
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { LanguageProvider } from '@/lib/LanguageContext';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  
  if (!user || user.role !== 'VENDOR') {
    redirect('/inscription/vendeur');
  }

  // --- CORRECTION ICI ---
  const isCommission = user.sellerPlanType === "COMMISSION";
  
  // Si ce n'est PAS commission ET que l'abonnement n'est pas valide, on redirige
  // Vous devrez peut-être importer isSubscriptionValid si vous ne l'avez pas déjà
  if (!isCommission) {
     // Import dynamique ou vérification simple selon votre setup
     const { isSubscriptionValid } = await import('@/lib/auth');
     if (!isSubscriptionValid(user)) {
       redirect('/inscription/vendeur/abonnement');
     }
  }
  // Si isCommission est true, on saute la vérification et on affiche le dashboard

  return (
    <LanguageProvider>
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </LanguageProvider>
  );
}   