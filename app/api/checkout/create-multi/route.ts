import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculerCommission } from '@/lib/commission';
import { sendSaleEmail } from '@/lib/send-sale-email';
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
    const { items, totalAmount, paymentMethod, phoneNumber } = body as {
      items: CartItemPayload[];
      totalAmount: number;
      paymentMethod: 'STRIPE' | 'MOBILE_MONEY';
      phoneNumber?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    const bookIds = items.map((item) => item.bookId);
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true, vendorId: true, imageUrl: true },
    });
    const bookMap = new Map(books.map((b) => [b.id, b]));

    for (const item of items) {
      if (!bookMap.has(item.bookId)) {
        return NextResponse.json({ error: `Livre ${item.bookId} non trouvé` }, { status: 404 });
      }
    }

    // ───────────────────────────────────────────────────────
    // MOBILE MONEY : une seule commande, tous articles/vendeurs inclus,
    // paiement unique vers TON numéro (MOBILE_MONEY_PHONE)
    // ───────────────────────────────────────────────────────
    if (paymentMethod === 'MOBILE_MONEY') {
      if (!phoneNumber) {
        return NextResponse.json({ error: 'Numéro de téléphone requis pour Mobile Money' }, { status: 400 });
      }

      const platformFee = items.reduce(
        (sum, item) => sum + calculerCommission(item.price) * item.quantity,
        0
      );
      const vendorPaymentAmount = totalAmount - platformFee;
      const clientTrxRef = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      const order = await prisma.order.create({
        data: {
          type: 'BUY',
          paymentMethod: 'MOBILE_MONEY',
          paymentStatus: 'PENDING',
          deliveryStatus: 'PENDING',
          amount: totalAmount,
          phoneNumber,
          userId: user.id,
          paidToVendor: false,
          mvolaStatus: 'EN_ATTENTE_CLIENT',
          clientTrxRef,
          platformFee,
          vendorPaymentAmount,
          items: {
            create: items.map((item) => ({
              bookId: item.bookId,
              sellerId: item.vendorId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          user: true,
          items: { include: { book: true, seller: true } },
        },
      });

      // Notifie chaque vendeur distinct pour ses propres articles
      const byVendor = new Map<string, typeof order.items>();
      for (const it of order.items) {
        const arr = byVendor.get(it.sellerId) ?? [];
        arr.push(it);
        byVendor.set(it.sellerId, arr);
      }

      for (const [, vendorItems] of byVendor) {
        const seller = vendorItems[0]?.seller;
        if (!seller?.email) continue;
        try {
          const vendorSubtotal = vendorItems.reduce((s, it) => s + Number(it.price) * it.quantity, 0);
          const vendorFee = calculerCommission(vendorSubtotal);
          await sendSaleEmail({
            vendorEmail: seller.email,
            bookTitle: vendorItems.map((it) => it.book.title).join(', '),
            buyerName: order.user.firstName || order.user.email,
            price: vendorSubtotal,
            commission: vendorFee,
            gain: vendorSubtotal - vendorFee,
            buyerPhone: order.phoneNumber || order.user.phoneNumber || null,
            deliveryLocation: order.user.location || null,
          });
        } catch (emailError) {
          console.error('Échec envoi email vendeur:', emailError);
        }
      }

      return NextResponse.json({ mvolaUrl: `/client/paiement-mvola/${order.id}` });
    }

    // ───────────────────────────────────────────────────────
    // STRIPE : une commande par vendeur (comportement existant)
    // ───────────────────────────────────────────────────────
    const groupedByVendor = items.reduce((acc, item) => {
      (acc[item.vendorId] ??= []).push(item);
      return acc;
    }, {} as Record<string, CartItemPayload[]>);

    const orders: string[] = [];
    for (const [vendorId, vendorItems] of Object.entries(groupedByVendor)) {
      const vendorAmount = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const platformFee = calculerCommission(vendorAmount);
      const order = await prisma.order.create({
        data: {
          type: 'BUY',
          paymentMethod: 'STRIPE',
          paymentStatus: 'PENDING',
          deliveryStatus: 'PENDING',
          amount: vendorAmount,
          platformFee,
          vendorPaymentAmount: vendorAmount - platformFee,
          clientTrxRef: `STR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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

    const lineItems = items.map((item) => {
      const book = bookMap.get(item.bookId);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: book?.title || 'Livre',
            images: book?.imageUrl ? [book.imageUrl] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
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
      metadata: { orders: orders.join(','), userId: user.id },
    });

    return NextResponse.json({ stripeUrl: session.url });
  } catch (error) {
    console.error('Erreur checkout multi:', error);
    return NextResponse.json({ error: 'Erreur lors du paiement' }, { status: 500 });
  }
}