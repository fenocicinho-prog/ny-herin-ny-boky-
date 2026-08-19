'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { RefreshCw, TrendingUp, Wallet, ShoppingBag, CheckCircle, Clock } from 'lucide-react'

type Order = {
  id: string
  clientTrxRef: string
  adminTrxRef: string | null
  amount: number
  platformFee: number
  vendorPaymentAmount: number
  mvolaStatus: string
  paymentStatus: string
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    book: { title: string }
    seller: {
      firstName: string | null
      lastName: string | null
      mvolaNumber: string | null
      sellerProfile: { mvolaNumber: string | null } | null
    }
  }[]
}

export default function AdminPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ FIX : la fonction fetchOrders est définie sans useCallback
  // pour éviter l'erreur "setState synchronously within an effect"
  async function fetchOrders() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (res.status === 403) {
        console.error("Accès refusé")
        return
      }
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erreur chargement:", err)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ FIX : on passe une fonction fléchée dans useEffect
  // au lieu d'appeler fetchOrders directement
  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/admin/orders')
        if (res.status === 403) return
        const data = await res.json()
        if (!cancelled) setOrders(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setOrders([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, []) // ← tableau vide : charge une seule fois au montage

  const totalCommission = orders.reduce((sum, o) => sum + (o.platformFee || 0), 0)
  const totalAverser = orders.reduce((sum, o) => sum + (o.vendorPaymentAmount || 0), 0)
  const validated = orders.filter(o => o.mvolaStatus === 'TERMINE' || o.mvolaStatus === 'PAYE').length
  const pending = orders.length - validated

  async function handleValidatePayment(orderId: string) {
    if (!confirm(t("admin.confirmReceived"))) return
    setLoadingId(orderId)
    try {
      const res = await fetch('/api/admin/validate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.order) {
          setOrders(prev =>
            prev.map(o =>
              o.id === orderId
                ? { ...o, mvolaStatus: 'TERMINE', paymentStatus: 'COMPLETED' }
                : o
            )
          )
        } else {
          setOrders(prev => prev.filter(o => o.id !== orderId))
        }
        alert(t("admin.paymentValidated"))
      } else {
        const err = await res.json().catch(() => ({}))
        alert(`Erreur: ${err.error || "Échec de la validation"}`)
      }
    } catch (e) {
      console.error(e)
      alert(t("admin.networkError"))
    } finally {
      setLoadingId(null)
    }
  }

  const isValidated = (status: string) => status === 'TERMINE' || status === 'PAYE'

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 p-6 lg:p-10">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{t("admin.title")}</h1>
          <p className="mt-1 text-sm text-stone-500">
            Fanarahamaso ny fanerena sy ny fandoavana rehetra
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? t("admin.loading") : t("admin.refresh")}
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <ShoppingBag className="h-5 w-5 text-amber-700" />
          </div>
          <p className="text-sm text-stone-500">{t("admin.pendingSales")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{orders.length}</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-sm text-stone-500">Miandry fanamarinana</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">{pending}</p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-stone-500">{t("admin.commission")}</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {totalCommission.toLocaleString()} Ar
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-sm text-stone-500">{t("admin.toVendor")}</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {totalAverser.toLocaleString()} Ar
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-stone-100 px-6 py-4">
          <h2 className="font-semibold text-stone-800">
            Lisitry ny kaomandy —{' '}
            <span className="text-amber-700">{validated} voamarina</span>
            {' '}/ {orders.length} rehetra
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <CheckCircle className="mb-3 h-12 w-12 text-green-300" />
            <p className="font-medium">{t("admin.noOrders")}</p>
            <p className="text-sm">Rehetra voamarina tsara 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-3">{t("admin.date")}</th>
                  <th className="px-4 py-3">{t("admin.clientRef")}</th>
                  <th className="px-4 py-3">{t("admin.vendorDetails")}</th>
                  <th className="px-4 py-3">{t("admin.totalAmount")}</th>
                  <th className="px-4 py-3">{t("admin.commission_col")}</th>
                  <th className="px-4 py-3">{t("admin.mvolaStatus")}</th>
                  <th className="px-4 py-3">{t("admin.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-amber-50/30 transition-colors">

                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-stone-100 px-2 py-1 font-mono text-xs text-stone-700">
                        {o.clientTrxRef}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {o.items.map(item => (
                        <div key={item.id} className="mb-2 last:mb-0">
                          <p className="font-semibold text-stone-800">{item.book.title}</p>
                          <p className="text-xs text-stone-500">
                            {t("admin.vendor")}: {item.seller.firstName} {item.seller.lastName}
                          </p>
                          <p className="text-xs font-bold text-green-700">
                            MVola: {item.seller.mvolaNumber || item.seller.sellerProfile?.mvolaNumber || (
                              <span className="text-red-400">{t("admin.notSet")}</span>
                            )}
                          </p>
                          <p className="text-xs text-stone-500">
                            {t("admin.toPay")}: {(item.price * item.quantity).toLocaleString()} Ar
                          </p>
                        </div>
                      ))}
                    </td>

                    <td className="px-4 py-3 font-bold text-stone-900 whitespace-nowrap">
                      {o.amount.toLocaleString()} Ar
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        +{o.platformFee.toLocaleString()} Ar
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isValidated(o.mvolaStatus)
                          ? 'bg-green-100 text-green-700'
                          : o.mvolaStatus === 'EN_ATTENTE_VERIFICATION'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {isValidated(o.mvolaStatus) && <CheckCircle className="h-3 w-3" />}
                        {o.mvolaStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleValidatePayment(o.id)}
                        disabled={loadingId === o.id || isValidated(o.mvolaStatus)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                          isValidated(o.mvolaStatus)
                            ? 'bg-green-50 text-green-600 cursor-default'
                            : loadingId === o.id
                            ? 'bg-stone-100 text-stone-400 cursor-wait'
                            : 'bg-amber-700 text-white hover:bg-amber-800 shadow-sm hover:shadow'
                        }`}
                      >
                        {loadingId === o.id
                          ? '⏳'
                          : isValidated(o.mvolaStatus)
                          ? t("admin.validated")
                          : t("admin.confirm")}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}