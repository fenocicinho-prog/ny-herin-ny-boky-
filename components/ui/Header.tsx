import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-amber-700" />
          <span className="text-xl font-bold text-amber-900">{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/connexion/client"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 sm:inline-block"
          >
            Hiditra
          </Link>
          <Link
            href="/inscription/client"
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 transition-colors"
          >
            Hisoratra
          </Link>
        </div>
      </div>
    </header>
  );
}
