// lib/send-sale-email.ts
import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas configurée");
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }

  return resend;
}

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
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error("RESEND_FROM_EMAIL n'est pas configurée avec un domaine vérifié");
    }

    const resendClient = getResend();
    await resendClient.emails.send({
      from: fromEmail,
      // Le message doit être envoyé au vendeur concerné, pas à une adresse de test.
      to: vendorEmail,

      subject: `📚 Nouvelle commande : ${bookTitle}`,
      // lib/send-sale-email.ts
html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { font-family: Arial, sans-serif; background: #f9f5f0; margin: 0; padding: 20px; }
      .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .header { background: #92400e; padding: 24px 32px; }
      .header h1 { color: white; margin: 0; font-size: 20px; }
      .header p { color: #fde68a; margin: 4px 0 0; font-size: 14px; }
      .body { padding: 32px; }
      .book-title { font-size: 18px; font-weight: bold; color: #1c1917; margin-bottom: 24px; }
      .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f5f5f4; font-size: 14px; }
      .row:last-child { border-bottom: none; }
      .label { color: #78716c; }
      .value { font-weight: 600; color: #1c1917; }
      .gain { color: #15803d; font-size: 18px; }
      .alert { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 24px 0; }
      .alert p { margin: 0; font-size: 14px; color: #92400e; }
      .btn { display: inline-block; background: #92400e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
      .footer { background: #f9f5f0; padding: 16px 32px; text-align: center; font-size: 12px; color: #a8a29e; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📚 Nouvelle commande reçue</h1>
        <p>Ny Herin'ny Boky — Marketplace</p>
      </div>

      <div class="body">
        <p style="color:#78716c;font-size:14px;margin-top:0;">Bonjour,</p>
        <p class="book-title">"${bookTitle}"</p>

        <div class="row">
          <span class="label">👤 Acheteur</span>
          <span class="value">${buyerName}</span>
        </div>
        <div class="row">
          <span class="label">💰 Montant total</span>
          <span class="value">${price.toLocaleString('fr-FR')} Ar</span>
        </div>
        <div class="row">
          <span class="label">📊 Commission plateforme</span>
          <span class="value" style="color:#dc2626;">- ${commission.toLocaleString('fr-FR')} Ar</span>
        </div>
        <div class="row">
          <span class="label">✅ Votre gain net</span>
          <span class="value gain">+ ${gain.toLocaleString('fr-FR')} Ar</span>
        </div>

        ${buyerPhone ? `
        <div class="alert">
          <p>📞 Contactez l'acheteur pour la livraison :</p>
          <p style="font-size:20px;font-weight:bold;margin-top:8px;">${buyerPhone}</p>
        </div>
        ` : ''}

        ${deliveryLocation ? `
        <div style="margin-top:16px;">
          <p style="font-size:14px;color:#78716c;margin-bottom:8px;">📍 Localisation de livraison :</p>
          <p style="font-weight:600;color:#1c1917;margin:0 0 12px;">${deliveryLocation}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryLocation)}" class="btn">
            Voir sur Google Maps
          </a>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        Ny Herin'ny Boky • Ne pas répondre à cet email
      </div>
    </div>
  </body>
  </html>
`,
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
} 