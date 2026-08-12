"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Mail, MapPin, Calendar, Package, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { formatPrice } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth";
import type { TranslationKey } from "@/lib/translations";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
}

interface OrderType {
  id: string;
  clientTrxRef: string;
  amount: number;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: Date;
  items: OrderItem[];
}

interface ClientProfileContentProps {
  user: SessionUser;
  orders: OrderType[];
}

// ... le reste du fichier ne change pas, juste retire l'interface UserType

function statusBadgeClasses(status: string) {
  if (status === "COMPLETED") return "bg-green-100 text-green-800";
  if (status === "CANCELLED") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

function deliveryLabel(status: string, t: (key: TranslationKey) => string) {
  if (status === "DELIVERED") return t("profile_delivery_delivered");
  if (status === "IN_TRANSIT") return t("profile_delivery_transit");
  return t("profile_delivery_pending");
}

function paymentLabel(status: string, t: (key: TranslationKey) => string) {
  if (status === "COMPLETED") return t("profile_status_completed");
  if (status === "CANCELLED") return t("profile_status_cancelled");
  return t("profile_status_pending");
}

export default function ClientProfileContent({ user, orders }: ClientProfileContentProps) {
  const { t } = useLanguage();

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || t("profile_name");
  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={user} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-stone-900">{t("profile_title")}</h1>

        {/* Infos personnelles */}
        <section className="mb-8 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <User className="h-8 w-8 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-900" translate="no">
                {fullName}
              </h2>
              <p className="text-sm text-stone-500">{t("profile_member_since")} {memberSince}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-stone-100 pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-amber-700" />
              <span className="text-stone-500">{t("profile_email")}:</span>
              <span className="font-medium text-stone-900" translate="no">{user.email}</span>
            </div>
            {user.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-amber-700" />
                <span className="text-stone-500">{t("profile_location")}:</span>
                <span className="font-medium text-stone-900" translate="no">{user.location}</span>
              </div>
            )}
          </div>
        </section>

        {/* Historique des commandes */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
            <Package className="h-5 w-5 text-amber-700" />
            {t("profile_orders_title")}
          </h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 py-12 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-amber-300" />
              <p className="text-stone-500">{t("profile_no_orders")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      <span className="mx-1">·</span>
                      <span>{t("profile_order_ref")}: {order.clientTrxRef}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClasses(order.paymentStatus)}`}>
                        {paymentLabel(order.paymentStatus, t)}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                        {deliveryLabel(order.deliveryStatus, t)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-amber-50">
                          {item.book.imageUrl && (
                            <Image
                              src={item.book.imageUrl}
                              alt={item.book.title}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-stone-900" translate="no">
                            {item.book.title}
                          </p>
                          <p className="text-xs text-stone-500">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-end border-t border-stone-100 pt-3">
                    <span className="text-sm font-semibold text-stone-900">
                      {t("profile_order_amount")}: {formatPrice(order.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Link
          href="/client"
          className="mt-8 flex items-center gap-2 text-sm font-medium text-amber-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("profile_back_home")}
        </Link>
      </div>
    </div>
  );
}