import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteButton'
import type { CrosswordRow } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function AdminListPage() {
  const supabase = await createClient()
  const res = await supabase
    .from('crosswords')
    .select('*')
    .order('updated_at', { ascending: false })
  const rows = res.data as CrosswordRow[] | null
  const error = res.error

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>кроссворды</h1>
        <Link href="/admin/new" style={{
          padding: '8px 14px',
          background: '#111827',
          color: '#fff',
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
          background: '#fef2f2', color: '#dc2626', fontSize: '12px',
          marginBottom: '16px',
        }}>
          {error.message}
        </div>
      )}

      {!error && (!rows || rows.length === 0) ? (
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          color: '#9ca3af', fontSize: '14px',
        }}>
          пока ничего нет. создай первый кроссворд.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {rows?.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px',
              background: '#fff',
              border: '1px solid #f3f4f6',
              borderRadius: '12px',
            }}>
              <span style={{ fontSize: '24px' }}>{r.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {r.category} · {r.word_count} слов · {r.difficulty}
                  {!r.published && <span style={{ marginLeft: '8px', color: '#f59e0b' }}>· черновик</span>}
                </div>
              </div>
              <Link href={`/admin/edit/${r.id}`} style={{
                padding: '6px 12px', background: '#f3f4f6',
                borderRadius: '8px', fontSize: '12px', color: '#374151',
              }}>
                редактировать
              </Link>
              <DeleteButton id={r.id} title={r.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
