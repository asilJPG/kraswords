'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCrossword } from '@/lib/crossword/api'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doDelete = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteCrossword(id)
      setOpen(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
        <button
          onClick={() => { setError(null); setOpen(true) }}
          disabled={busy}
          style={{
            padding: '6px 10px',
            background: 'transparent',
            border: '1px solid var(--danger-border)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--danger)',
            cursor: busy ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: busy ? 0.6 : 1,
          }}
        >
          ×
        </button>
        {error && (
          <span style={{
            fontSize: '10px', color: 'var(--danger)',
            maxWidth: '120px', textAlign: 'right',
          }}>
            {error}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={open}
        title={`Удалить "${title}"?`}
        message="Кроссворд удалится безвозвратно. Игроки больше не смогут его открыть."
        confirmLabel="удалить"
        variant="danger"
        busy={busy}
        onConfirm={doDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
