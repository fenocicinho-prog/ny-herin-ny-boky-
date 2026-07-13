import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { confirmMobilePaymentFormAction } from "@/app/actions/orders";
import { MOBILE_MONEY_PHONE, formatPrice } from "@/lib/constants";
import { redirect } from "next/navigation";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/connexion/client");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { book: true },
  });

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Tsy hita ny kaomandy.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-stone-900">Fanamarinana fandoavana</h1>
        <p className="mt-2 text-sm text-stone-500">{order.book.title}</p>

        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Mobile Money</p>
          <p className="mt-2">Alefaso ny vola amin&apos;ny: <strong>{MOBILE_MONEY_PHONE}</strong></p>
          <p className="mt-1">Vola: <strong>{formatPrice(order.amount)}</strong></p>
          <p className="mt-1">Laharana finday: <strong>{order.phoneNumber}</strong></p>
          <p className="mt-1">Reference: <strong>{order.id.slice(-8).toUpperCase()}</strong></p>
        </div>

        <p className="mt-4 text-xs text-stone-500">
          Rehefa vita ny fandefasana, tsindrio ny bokotra eto ambany mba hanamafisana (demo).
        </p>

        <form action={confirmMobilePaymentFormAction} className="mt-6">
          <input type="hidden" name="orderId" value={order.id} />
          <button type="submit" className="w-full rounded-xl bg-amber-700 py-3 font-medium text-white hover:bg-amber-800">
            Nanome vola aho — Manamarina
          </button>
        </form>

        <Link href="/client" className="mt-4 block text-center text-sm text-amber-700 hover:underline">
          Miverina amin&apos;ny dashboard
        </Link>
      </div>
    </div>
  );
}
