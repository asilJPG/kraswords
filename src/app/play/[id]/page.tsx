import { notFound } from 'next/navigation'
import { fetchCrosswordById } from '@/lib/crossword/server-api'
import CrosswordGame from '@/components/CrosswordGame'

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crossword = await fetchCrosswordById(id)
  if (!crossword) notFound()

  return <CrosswordGame crossword={crossword} />
}
