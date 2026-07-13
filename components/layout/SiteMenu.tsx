import Link from "next/link";
import {
  Home,
  BookOpen,
  ShoppingBag,
  User,
  Store,
  HelpCircle,
} from "lucide-react";

const menuItems = [
  { href: "/", icon: Home, label: "Fandraisana" },
  { href: "/client", icon: BookOpen, label: "Boky" },
  { href: "/client", icon: ShoppingBag, label: "Kaomandy" },
  { href: "/inscription/client", icon: User, label: "Kaonty" },
  { href: "/inscription/vendeur", icon: Store, label: "Mpivarotra" },
  { href: "#", icon: HelpCircle, label: "Fanampiana" },
];

export function SiteMenu() {
  return (
    <aside className="w-full shrink-0 lg:w-56">
      <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-700">
          Menu
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
