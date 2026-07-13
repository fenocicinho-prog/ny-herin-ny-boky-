'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { BookOpen, PlusCircle, CreditCard, LayoutGrid } from "lucide-react";

const menuItems = [
    { id: "accueil", href: "/vendeur/dashboard", label:"Fandraisana", icon: LayoutGrid },
    { id: "boky", href: "/vendeur/dashboard", label:"Boky", icon: BookOpen },
    { id: "nouveau", href: "/vendeur/dashboard/nouveau-livre", label:"+ Boky vaovao", icon: PlusCircle },
    { id: "abo", href: "/vendeur/dashboard/abonnement", label:"Abonnement", icon: CreditCard },
];

export default function VendeurLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-[#1e1e2d] text-white p-4 flex-col">
                <h1 className="font_bold text-xl mb-8 flex items-center bap-2"> <BookOpen/> Ny herin'ny boky</h1>
                <nav className="flex flex-col gap-2 hover-amber-500">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-3 p-3 rouned-lg transition-colors 
                                    ${isActive ? "bg-amber-900 font-bold" : "hover:bg-[#2e2e3e]"}
                                    `}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* 4. CONTENU PRICNIPAL */}
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}