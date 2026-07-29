'use client'

import Link from 'next/link'
import { Home, Plus, CheckCircle } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe-server'

interface SubscriptionActiveProps {
  plan: 'FREE' | 'TWENTY_BOOKS' | 'UNLIMITED'
  expiresAt: Date | null
  daysRemaining: number | null
  currentBookCount: number
}

export function SubscriptionActive({
  plan,
  expiresAt,
  daysRemaining,
  currentBookCount,
}: SubscriptionActiveProps) {
  const planInfo = SUBSCRIPTION_PLANS[plan]
  const maxBooks = planInfo.maxBooks || 1

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        {/* Success header */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-green-900">Abonnement Actif</h1>
        </div>

        {/* Plan details card */}
        <div className="mb-8 rounded-2xl border border-green-200 bg-white p-8 shadow-lg">
          <div className="mb-6">
            <p className="text-sm text-stone-500">Votre plan actuel</p>
            <h2 className="text-4xl font-bold text-green-700">{planInfo.name}</h2>
          </div>

          {/* Plan features grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {/* Books limit */}
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-semibold text-stone-600">Limite de livres</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-700">{maxBooks === Infinity ? '∞' : maxBooks}</span>
                {maxBooks !== Infinity && (
                  <span className="text-sm text-stone-500">livres maximum</span>
                )}
              </div>
              <div className="mt-2 bg-white rounded p-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600">Utilisé</span>
                  <span className="font-semibold text-green-700">{currentBookCount}/{maxBooks === Infinity ? '∞' : maxBooks}</span>
                </div>
                {maxBooks !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(currentBookCount / maxBooks) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Expiration date */}
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm font-semibold text-stone-600">Date d'expiration</p>
              {expiresAt ? (
                <>
                  <p className="mt-2 text-sm text-stone-700">{formatDate(expiresAt)}</p>
                  <div className="mt-3 rounded bg-white px-3 py-2">
                    <p className="text-center text-lg font-bold text-amber-700">
                      {daysRemaining === null
                        ? 'Illimité'
                        : daysRemaining === 0
                          ? '⚠️ Expire aujourd\'hui'
                          : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-lg font-semibold text-green-700">Abonnement illimité</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="mb-6 border-t border-green-200 pt-6 text-center text-sm text-stone-600">
            {planInfo.description}
          </p>

          {/* Action buttons */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/vendeur/dashboard/nouveau-livre"
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-green-700 transition"
            >
              <Plus className="h-5 w-5" />
              Ajouter un livre
            </Link>
            <Link
              href="/vendeur/dashboard"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-stone-300 px-6 py-3 font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              <Home className="h-5 w-5" />
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
