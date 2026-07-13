import type { SessionUser } from "@/lib/auth";
import { MapPin, Mail, Package, BookMarked } from "lucide-react";

interface VendorProfileProps {
  user: SessionUser;
  stats: { sold: number; borrowed: number };
}

export function VendorProfile({ user, stats }: VendorProfileProps) {
  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-800">
          {user.companyName?.[0]?.toUpperCase() || "V"}
        </div>
        <h2 className="text-lg font-semibold text-stone-900">
          {user.companyName}
        </h2>
        <p className="text-sm text-stone-500">Mpivarotra</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <Package className="mx-auto h-5 w-5 text-amber-600" />
            <p className="mt-1 text-xl font-bold text-amber-900">{stats.sold}</p>
            <p className="text-xs text-stone-500">Lafo</p>
          </div>
          <div className="rounded-xl bg-stone-50 p-3 text-center">
            <BookMarked className="mx-auto h-5 w-5 text-stone-600" />
            <p className="mt-1 text-xl font-bold text-stone-900">
              {stats.borrowed}
            </p>
            <p className="text-xs text-stone-500">Hiray</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-amber-50 pt-4 text-sm">
          <div className="flex items-center gap-2 text-stone-600">
            <Mail className="h-4 w-4 text-amber-500" />
            {user.email}
          </div>
          {user.location && (
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin className="h-4 w-4 text-amber-500" />
              {user.location}
              {user.postalCode && ` (${user.postalCode})`}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
