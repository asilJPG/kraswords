import { getCrossword } from '@/lib/crosswords'
import { notFound } from 'next/navigation'
import CrosswordGame from '@/components/CrosswordGame'

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crossword = getCrossword(id)
  if (!crossword) notFound()

  return <CrosswordGame crossword={crossword} />
}
