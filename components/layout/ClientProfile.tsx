"use client";

import type { SessionUser } from "@/lib/auth";
import { MapPin, Mail, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface ClientProfileProps {
  user: SessionUser | null;
}

export function ClientProfile({ user }: ClientProfileProps) {
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <div translate="no" className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-800">
          {user.firstName?.[0]?.toUpperCase() || "C"}
        </div>
        <h2 className="text-lg font-semibold text-stone-900" translate="no">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-sm text-stone-500">
          {user.role === "VENDOR" ? t("nav.vendor") : t("nav.client")}
        </p>

        <div className="mt-4 space-y-3 border-t border-amber-50 pt-4 text-sm">
          <div className="flex items-center gap-2 text-stone-600">
            <Mail className="h-4 w-4 text-amber-500" />
            {user.email}
          </div>
          {user.location && (
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin className="h-4 w-4 text-amber-500" />
              {user.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-stone-600">
            <Calendar className="h-4 w-4 text-amber-500" />
            {t("profile.since")} {new Date(user.createdAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
    </aside>
  );
}
