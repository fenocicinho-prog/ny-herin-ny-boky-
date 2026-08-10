import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CartItemPayload {
  bookId: string;
  type: 'BUY' | 'BORROW';
  quantity: number;
  price: number;
  vendorId: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { items, totalAmount } = body as {
      items: CartItemPayload[];
      totalAmount: number;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    // Vérifier que tous les livres existent et obtenir leurs détails
    const bookIds = items.map((item) => item.bookId);
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true, vendorId: true, imageUrl: true },
    });

    const bookMap = new Map(books.map((b) => [b.id, b]));

    // Valider que tous les livres existent
    for (const item of items) {
      if (!bookMap.has(item.bookId)) {
        return NextResponse.json(
          { error: `Livre ${item.bookId} non trouvé` },
          { status: 404 }
        );
      }
    }

    // Grouper par vendeur
    const groupedByVendor = items.reduce(
      (acc, item) => {
        if (!acc[item.vendorId]) {
          acc[item.vendorId] = [];
        }
        acc[item.vendorId].push(item);
        return acc;
      },
      {} as Record<string, CartItemPayload[]>
    );

    // Créer les commandes pour chaque vendeur
    const orders: string[] = [];

    for (const [vendorId, vendorItems] of Object.entries(groupedByVendor)) {
      // Créer l'Order principal
      const order = await prisma.order.create({
        data: {
          type: 'BUY',
          paymentMethod: 'STRIPE',
          paymentStatus: 'PENDING',
          deliveryStatus: 'PENDING',
          amount: vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          clientTrxRef: `TRX-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: user.id,
          items: {
            create: vendorItems.map((item) => ({
              bookId: item.bookId,
              sellerId: vendorId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      orders.push(order.id);
    }

    // Créer la session Stripe
    const lineItems = items.map((item) => {
      const book = bookMap.get(item.bookId);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: book?.title || 'Livre',
            images: book?.imageUrl ? [book.imageUrl] : undefined,
            description: `${item.type === 'BUY' ? 'Achat' : 'Location'} - Vendeur: ${item.vendorId}`,
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/client?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/client/panier?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        orders: orders.join(','),
        userId: user.id,
      },
    });

    return NextResponse.json({ stripeUrl: session.url });
  } catch (error) {
    console.error('Erreur checkout multi:', error);
    return NextResponse.json(
      { error: 'Erreur lors du paiement' },
      { status: 500 }
    );
  }
}
