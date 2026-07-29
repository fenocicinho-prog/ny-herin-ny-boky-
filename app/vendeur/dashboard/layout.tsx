import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  if (!user || user.role !== 'VENDOR') {
    redirect('/inscription/vendeur')
  }

  return <>{children}</>
}
