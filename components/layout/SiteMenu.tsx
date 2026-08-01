'use client'

import Link from "next/link";
import {
  Home,
  ShoppingBag,
  User,
  Store,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export function SiteMenu() {
  const { t } = useLanguage();
const menuItems = [
  { href: "/", icon: Home, label: t("nav.home") },
  { href: "/client/commande/latest", icon: ShoppingBag, label: t("vendorDashboard.sales") },
  { href: "/client/profile", icon: User, label: t("nav.profile") },
  { href: "/client/vendeurList", icon: Store, label: t("nav.vendor") },
  { href: "#", icon: HelpCircle, label: t("vendorProfile.help") },
  ];
  return (
    <aside className="w-full shrink-0 lg:w-56">
      <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-700">
          {t("nav.menu")}
        </h3>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-700 transition hover:bg-amber-50 hover:text-amber-900"
            >
              <item.icon className="h-4 w-4 shrink-0 text-amber-600" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
