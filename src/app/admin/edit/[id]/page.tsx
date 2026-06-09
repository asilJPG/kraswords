import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CrosswordEditor from '@/components/admin/CrosswordEditor'
import type { EditorWord } from '@/lib/crossword/editor'
import type { Clue } from '@/lib/crossword/types'
import type { CrosswordMeta } from '@/components/admin/hooks/useEditorState'
import type { CrosswordRow } from '@/lib/supabase/types'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const res = await supabase
    .from('crosswords')
    .select('*')
    .eq('id', id)
    .single()

  const data = res.data as CrosswordRow | null
  if (res.error || !data) notFound()

  const meta: Partial<CrosswordMeta> = {
    id: data.id,
    title: data.title,
    author: data.author,
    emoji: data.emoji,
    category: data.category,
    difficulty: data.difficulty,
    theme_id: data.theme_id,
    size: data.size,
    published: data.published,
  }

  const words: EditorWord[] = (data.clues as Clue[]).map(c => ({
    id: `${c.number}-${c.direction}`,
    answer: c.answer,
    clue: c.clue,
    row: c.row,
    col: c.col,
    direction: c.direction,
    placed: true,
  }))

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
        {data.title}
      </h1>
      <CrosswordEditor draftId={`edit-${id}`} initialMeta={meta} initialWords={words} />
    </div>
  )
}
