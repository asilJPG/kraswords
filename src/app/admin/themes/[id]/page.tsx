import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin-client'
import ThemeForm from '@/components/admin/ThemeForm'
import type { ThemeConfigDraft } from '@/components/admin/ThemeEditor'

interface ThemeRow {
  id: string
  name: string
  config: ThemeConfigDraft
}

export default async function EditThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('themes_custom') as any)
    .select('*').eq('id', id).single()
  const row = data as ThemeRow | null
  if (!row) notFound()

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
        {row.name}
      </h1>
      <ThemeForm
        mode="edit"
        initialId={row.id}
        initialName={row.name}
        initialConfig={row.config ?? {}}
      />
    </div>
  )
}
