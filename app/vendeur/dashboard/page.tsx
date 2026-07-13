import { getSessionUser, getSubscriptionDaysRemaining, isSubscriptionValid } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DeleteButton } from '@/components/button/DeleteButton'
import { deleteBookAction } from '@/app/actions/books'
import { LogOut } from 'lucide-react'

export default async function VendorDashboardPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'VENDOR') redirect('/inscription/vendeur')
  const subscriptionValid = isSubscriptionValid(user)
  const daysRemaining = getSubscriptionDaysRemaining(user)

  const books = await prisma.book.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: 'desc' }
  })
  let bookLimit = 1
  if (user.subscriptionPlan === 'TWENTY_BOOKS') {
    bookLimit = 20
  } else if (user.subscriptionPlan === 'UNLIMITED') {
    bookLimit = 999
  }

  return (
     <div className="p-8">
       {!subscriptionValid ? (
         <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
           Ny abonnement-nao dia tapitra na tsy mbola navotsotra. Azafady manavao ny planinao
           <Link href="/vendeur/dashboard/abonnement" className="font-semibold text-red-900 underline">
             eto
           </Link>
           .
         </div>
       ) : daysRemaining !== null && daysRemaining <= 2 ? (
         <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
           Hifarana ao anatin'ny {daysRemaining} andro ny abonnement anao. Azafady manavao mialoha.
         </div>
       ) : null}
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold">Mes livres {books.length}/{bookLimit}</h1>
         
         {books.length < bookLimit && (
           <Link 
             href="/vendeur/dashboard/nouveau-livre"
             className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
           >
             + ajouter
           </Link>
         )}
       </div>
 
       {books.length === 0 ? (
         <p className="text-gray-500">Aucun livre. Commence.</p>
       ) : (
         <div className="grid grid-cols-2 gap-4">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2">
            {books.map(book => (
              <div key={book.id} className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-3 flex-col">

                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />

                <h3 className="font-bold text-gray-800 line-clamp-1">{book.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{book.category}</p>

                {/* PRIX VENTE ET LOCATION */}
                <div className="space-y-1 text-sm mb-3">
                  <p className="font-bold text-amber-700">Vente: {book.buyPrice} Ar</p>
                  {book.rentPrice && (
                    <p className="font-semibold text-green-700">Prêt: {book.rentPrice} Ar</p>
                  )}
                </div>

                {/* BOUTONS THEME ACCUEIL */}
                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/vendeur/dashboard/modifier/${book.id}`}
                    className="flex-1 text-center px-2 py-2 border border-amber-600 text-amber-600 rounded-lg text-sm font-semibold hover:bg-amber-50 transition"
                  >
                    Modifier
                  </Link>
                  <DeleteButton bookId={book.id} action={deleteBookAction} />
                </div>

              </div>
            ))}
          </div>
         </div>
       )}
       <br />
       <Link 
          href="/vendeur"
          className='fixed bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700'
          >
            <LogOut className='h-4 w-4' />  
        </Link>
     </div>
   )
 }