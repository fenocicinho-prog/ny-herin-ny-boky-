import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
            <Image
              src="/logo-ny-herin-ny-boky.png"
              alt={APP_NAME}
              fill
              className="object-cover"
            />
          </div>
          <span className="hidden text-xl font-bold text-amber-900 sm:inline-block">
            {APP_NAME}
          </span>
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
