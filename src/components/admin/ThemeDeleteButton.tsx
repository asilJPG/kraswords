'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function ThemeDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doDelete = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/themes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'ошибка')
        return
      }
      setOpen(false)
      router.refresh()
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
            padding: '6px 10px', background: 'transparent',
            border: '1px solid var(--danger-border)', borderRadius: '8px',
            fontSize: '12px', color: 'var(--danger)',
            cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: busy ? 0.6 : 1,
          }}
        >
          ×
        </button>
        {error && (
          <span style={{ fontSize: '10px', color: 'var(--danger)', maxWidth: '120px', textAlign: 'right' }}>
            {error}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={open}
        title={`Удалить тему "${name}"?`}
        message="Кроссворды, использующие эту тему, потеряют оформление и переключатся на дефолт."
        confirmLabel="удалить"
        variant="danger"
        busy={busy}
        onConfirm={doDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
