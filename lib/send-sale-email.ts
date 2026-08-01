// lib/send-sale-email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSaleEmail({
  vendorEmail,
  bookTitle,
  buyerName,
  price,
  commission,
  gain,
  buyerPhone,
  deliveryLocation,
}: {
  vendorEmail: string;
  bookTitle: string;
  buyerName: string;
  price: number;
  commission: number;
  gain: number;
  buyerPhone?: string | null;
  deliveryLocation?: string | null;
}) {
  try {
    await resend.emails.send({
      // ✅ FROM : Doit être l'adresse par défaut de Resend
      from: 'onboarding@resend.dev', 
      
      // ✅ TO : Pour tester, forcez VOTRE email. 
      // Ne mettez PAS vendorEmail ici tant que vous n'avez pas vérifié de domaine.
      to: process.env.RESEND_ALLOW_UNVERIFIED === 'true' ? vendorEmail : (process.env.DEV_NOTIFICATION_EMAIL || 'achillecicinhofeno@gmail.com'),

      subject: `📚 Nouvelle commande : ${bookTitle}`,
      html: `
        <h1>Commande validée</h1>
        <p>Bonjour,</p>
        <p>Une commande pour votre livre <strong>${bookTitle}</strong> a été validée.</p>
        <ul>
          <li>Acheteur: ${buyerName}</li>
          <li>Montant: ${price} Ar</li>
          <li>Commission plateforme: ${commission} Ar</li>
          <li>Montant à reverser: ${gain} Ar</li>
        </ul>
        ${buyerPhone ? `<p>Veuillez contacter l'acheteur au: <strong>${buyerPhone}</strong></p>` : ''}
        ${deliveryLocation ? `<p>Localisation acheteur: <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryLocation)}">Voir la localisation</a></p>` : ''}
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
} 