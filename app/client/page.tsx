"use client";

import { Header } from "@/components/layout/Header";
import { ClientProfile } from "@/components/layout/ClientProfile";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SearchBarWrapper } from "@/components/layout/SearchBarWrapper";
import { CategoryFilter } from "@/components/books/CategoryFilter";
import { BookGrid } from "@/components/books/BookGrid";
import { DeliveryAlerts } from "@/components/orders/DeliveryAlerts";
import { useLanguage } from "@/lib/LanguageContext";
import { useEffect, useState } from "react";

type ClientDashboardProps = {
  initialData: {
    books: any[];
    ordersInTransit: any[];
    success?: string;
    payment?: string;
    query?: string;
    category?: string;
  };
};

export function ClientDashboardContent({ initialData }: ClientDashboardProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <ClientProfile user={null} />

        <main className="min-w-0 flex-1 space-y-6">
          {initialData.success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              {t("clientDashboard.success")}
            </div>
          )}
          {initialData.payment === "confirmed" && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              {t("clientDashboard.paymentPending")}
            </div>
          )}

          <SearchBarWrapper defaultValue={initialData.query || ""} />
          {initialData.ordersInTransit?.length > 0 && (
            <div className="mb-4">
              <DeliveryAlerts orders={initialData.ordersInTransit} />
            </div>
          )}
          <CategoryFilter
            activeCategory={initialData.category || "ALL"}
            basePath="/client"
            searchQuery={initialData.query || ""}
          />
          <BookGrid books={initialData.books} showActions />
        </main>

        <SiteMenu />
      </div>
    </div>
  );
}
