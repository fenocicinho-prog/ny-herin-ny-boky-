'use client'

import { useActionState } from 'react'
import { updateBookAction } from '@/app/actions/books'


export default function EditBookForm({ book }: {book: any }) {
    const [state, formAction] = useActionState(updateBookAction, null)
    
    return (
        <div className="max-w-lg mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Manova boky: {book.name}</h1>
            
            {/* 2. Le formulaire envoie vers la Server Action */}
            <form action={formAction} className="space-y-4">
                <input type='hidden' name='bookId' value={book.id} />
                
                <div>
                <label className="block mb-2 font-medium">Titre</label>
                <input name="name" defaultValue={book.title} required className="border w-full p-2 rounded"/>
                {/* Les erreurs sont gérées par les redirections ou les alertes globales */}
                </div>

                <div>
                <label className="block mb-2 font-medium">Prix Ar</label>
                <input name="buyPrice" type="number" defaultValue={book.buyPrice || ''} required className="border w-full p-2 rounded"/>
                </div>

                <div>
                <label className="block mb-2 font-medium">Prix Ar</label>
                <input name="rentPrice" type="number" defaultValue={book.rentPrice || ''} required className="border w-full p-2 rounded"/>
                </div>

                <div>
                <label className="block mb-2 font-medium">Catégorie</label>
                <input name="category" defaultValue={book.category} required className="border w-full p-2 rounded"/>
                </div>

                <div>
                <label className="block mb-2 font-medium">Image URL</label>
                <input name="imageUrl" defaultValue={book.imageUrl || ''} className="border w-full p-2 rounded"/>
                </div>

                <div>
                <label className="block mb-2 font-medium">Description</label>
                <textarea name="description" defaultValue={book.description || ''} rows={4} className="border w-full p-2 rounded"/>
                </div>

                <button className="w-full bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700">
                Tehirizo ny fanovana
                </button>
            </form>
        </div>
 
    )
} 
