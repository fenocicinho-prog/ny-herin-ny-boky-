import { User, MapPin, BookOpen } from "lucide-react";

interface ClientSidebarProps {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  location?: string | null;
  joinReason?: string | null;
  bookTypesSought?: string | null;
}

export function ClientSidebar({
  firstName,
  lastName,
  email,
  location,
  joinReason,
  bookTypesSought,
}: ClientSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-semibold text-stone-900">
            {firstName} {lastName}
          </h2>
          <p className="text-sm text-stone-500">{email}</p>
        </div>
      </div>

      {location && (
        <div className="flex items-start gap-2 text-sm text-stone-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>{location}</span>
        </div>
      )}

      {joinReason && (
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Antony fidirana
          </p>
          <p className="mt-1 text-sm text-stone-700">{joinReason}</p>
        </div>
      )}

      {bookTypesSought && (
        <div className="flex items-start gap-2 text-sm text-stone-600">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>{bookTypesSought}</span>
        </div>
      )}
    </aside>
  );
}
