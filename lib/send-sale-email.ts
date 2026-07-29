// lib/send-sale-email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSaleEmail({
  vendorEmail,
  bookTitle,
  buyerName,
  price,
  commission,
  gain
}: {
  vendorEmail: string;
  bookTitle: string;
  buyerName: string;
  price: number;
  commission: number;
  gain: number;
}) {
  try {
    await resend.emails.send({
      // ✅ FROM : Doit être l'adresse par défaut de Resend
      from: 'onboarding@resend.dev', 
      
      // ✅ TO : Pour tester, forcez VOTRE email. 
      // Ne mettez PAS vendorEmail ici tant que vous n'avez pas vérifié de domaine.
      to: 'achillecicinhofeno@gmail.com', 
      
      subject: `📚 Test Vente : ${bookTitle}`,
      html: `
        <h1>Test de notification</h1>
        <p>Ceci est un email de test envoyé à votre adresse vérifiée.</p>
        <p>Vendeur cible : ${vendorEmail}</p>
        <!-- Ajoutez le reste du contenu ici -->
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
} 