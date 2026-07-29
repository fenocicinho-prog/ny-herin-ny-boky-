'use client'

import { useLanguage } from "@/lib/LanguageContext";

export function DeleteButton({ bookId, action }: { bookId: string, action: (id: string) => Promise<any> }) {
    const { t } = useLanguage();
    const handleDelete = async () => {
        if(confirm(t("delete.confirm"))){
            await action(bookId)
        }
    }
    return (
        <button onClick={handleDelete} className="flex-1 px-2 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-500 transition">
            {t("book.delete")}
        </button>
    )
}
