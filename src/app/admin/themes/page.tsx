import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin-client'
import ThemeDeleteButton from '@/components/admin/ThemeDeleteButton'

export const dynamic = 'force-dynamic'

interface ThemeRow {
  id: string
  name: string
  config: Record<string, unknown>
  updated_at: string
}

export default async function ThemesListPage() {
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (supabase.from('themes_custom') as any)
    .select('*')
    .order('updated_at', { ascending: false })
  const rows = res.data as ThemeRow[] | null
  const error = res.error

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>темы</h1>
        <Link href="/admin/themes/new" style={{
          padding: '8px 14px',
          background: 'var(--text)',
          color: 'var(--bg)',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 500,
        }}>
          + создать
        </Link>
      </div>

      {error && (
        <div style={{
          padding: '12px 14px', borderRadius: '10px',
          background: 'var(--danger-soft)', color: 'var(--danger)',
          fontSize: '12px', marginBottom: '16px',
        }}>
          {error.message}
        </div>
      )}

      {!error && (!rows || rows.length === 0) ? (
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          color: 'var(--text-light)', fontSize: '14px',
        }}>
          пока нет своих тем. встроенные (Рик и Морти, Гарри Поттер) доступны всегда.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {rows?.map(r => {
            const accent = (r.config?.accentColor as string) ?? '#3b82f6'
            const bg = (r.config?.pageBg as string) ?? '#fafafa'
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}>
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '10px',
                  background: bg,
                  border: `2px solid ${accent}`,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                    {r.id.slice(0, 8)}…
                  </div>
                </div>
                <Link href={`/admin/themes/${r.id}`} style={{
                  padding: '6px 12px', background: 'var(--surface-2)',
                  borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)',
                }}>
                  редактировать
                </Link>
                <ThemeDeleteButton id={r.id} name={r.name} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
