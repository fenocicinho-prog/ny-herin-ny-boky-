// app/vendeur/dashboard/page.tsx
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
// ❌ SUPPRIMEZ l'import de LanguageProvider ici (il sera dans le layout global)
import { VendorDashboardClient } from '@/components/dashboard/VendorDashboardClient';

export default async function VendorDashboardPage() {
  const user = await getSessionUser();
  
  if (!user || user.role !== 'VENDOR') {
    redirect('/inscription/vendeur');
  }

  // Vérification d'accès : Si ce n'est pas commission ET pas valide, on bloque
  const isCommission = user.sellerPlanType === "COMMISSION";
  if (!isCommission) {
    const { isSubscriptionValid } = await import('@/lib/auth');
    if (!isSubscriptionValid(user)) redirect('/inscription/vendeur/abonnement');
  }

  const books = await prisma.book.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  // --- CORRECTION DE LA LIMITE ---
  let bookLimit = 1;
  if (isCommission) {
    bookLimit = 9999; // Limite très haute pour la commission (quasiment illimitée)
  } else if (user.subscriptionPlan === 'TWENTY_BOOKS') {
    bookLimit = 20;
  } else if (user.subscriptionPlan === 'UNLIMITED') {
    bookLimit = 9999;
  }

  const { getSubscriptionDaysRemaining, isSubscriptionValid } = await import('@/lib/auth');
  
  return (
    // ❌ NE METTEZ PAS LanguageProvider ici
    <VendorDashboardClient 
      user={user}
      bookCount={books.length}
      bookLimit={bookLimit}
      books={books}
      subscriptionValid={!isCommission || isSubscriptionValid(user)} // Force true si commission
      daysRemaining={getSubscriptionDaysRemaining(user)}
    />
  );
}   