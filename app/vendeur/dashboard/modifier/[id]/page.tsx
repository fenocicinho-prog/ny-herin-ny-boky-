import { prisma } from '@/lib/prisma'
import EditBookForm from './EditBookForm'

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await prisma.book.findUnique({ where: { id } })

  if (!book) return <div>Livre introuvable</div>

  return <EditBookForm book={book} />
}