'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookAction } from '@/app/actions/books'
import { useLanguage } from "@/lib/LanguageContext"

type FormState = { 
  error?: string; 
  success?: boolean; 
};

const initialState: FormState = {
  error: undefined,
  success: false,
};

export default function EditBookForm({ book }: { book: any }) {
  const router = useRouter()
  const { t } = useLanguage();
  
  // Correction : useActionState gère l'état, le composant reçoit juste 'book' en prop
  const [state, formAction, isPending] = useActionState(updateBookAction, initialState)

  // Redirection automatique si succès
  useEffect(() => {
    if (state?.success) {
      router.push('/vendeur/dashboard')
      router.refresh()
    }
  }, [state?.success, router])

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6"> {t("book.change")}: {book.title}</h1>
      
      {/* Affichage des messages globaux */}
      {state?.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {state.error}
        </div>
      )}
      
      <form action={formAction} className="space-y-4">
        <input type='hidden' name='bookId' value={book.id} />              
        <div>
          <label className="block text-sm font-medium text-stone-700"> {t("book.title")}</label>
          <input name="title" defaultValue={book.title} required className="border w-full p-2 rounded"/>
          {/* Les erreurs spécifiques par champ nécessitent que l'action renvoie un objet 'errors' */}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">{t("book.buyPrice")}</label>
          <input name="buyPrice" type="number" defaultValue={book.buyPrice || ''} required className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"/>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">{t("book.rentPrice")}</label>
          <input name="rentPrice" type="number" defaultValue={book.rentPrice || ''} required className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"/>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">{t("book.category")}</label>
          <input name="category" defaultValue={book.category} required className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">{t("book.imageUrl")}</label>
          <input name="imageUrl" defaultValue={book.imageUrl || ''} className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"/>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">{t("book.description")}</label>
          <textarea name="description" defaultValue={book.description || ''} rows={4} className="border w-full p-2 rounded"/>
        </div>
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? 'Miala aina...' : t("book.save")}
        </button>
      </form>
    </div>
  )
}   