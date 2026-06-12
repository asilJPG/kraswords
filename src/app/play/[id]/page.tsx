import { notFound } from 'next/navigation'
import { fetchCrosswordById } from '@/lib/crossword/server-api'
import { createClient } from '@/lib/supabase/server'
import CrosswordGame from '@/components/CrosswordGame'

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crossword = await fetchCrosswordById(id)
  if (!crossword) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <CrosswordGame crossword={crossword} isLoggedIn={!!user} />
}
