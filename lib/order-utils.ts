import { Order } from '@prisma/client';

export async function getOrderWithBook(orderId: string, prisma: any) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          book: true,
          seller: true
        }
      },
      user: true
    }
  });

  if (!order) return null;
  const firstItem = order.items[0];
  
  return {
    ...order,
    book: firstItem ? firstItem.book : null,
    bookId: firstItem ? firstItem.bookId : null,
    sellerId: firstItem ? firstItem.sellerId : null,
    items: order.items
  };
}   