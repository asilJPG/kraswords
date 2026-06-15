import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchCrosswordById } from '@/lib/crossword/server-api'
import { createClient } from '@/lib/supabase/server'
import CrosswordGame from '@/components/CrosswordGame'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const crossword = await fetchCrosswordById(id)
  if (!crossword) return {}

  const title = `Кроссворд «${crossword.title}» — играть онлайн`
  const description = `Современный тематический кроссворд «${crossword.title}» — играй бесплатно онлайн. ${crossword.wordCount} слов, уровень сложности: ${crossword.difficulty}. Без регистрации.`

  return {
    title,
    description,
    alternates: {
      canonical: `/play/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/play/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crossword = await fetchCrosswordById(id)
  if (!crossword) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <CrosswordGame crossword={crossword} isLoggedIn={!!user} />
}
