'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(t)
  }, [error])

  const onClick = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/crosswords/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'ошибка')
        return
      }
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
      <button onClick={onClick} disabled={busy} style={{
        padding: '6px 12px',
        background: published ? 'var(--accent-soft)' : 'var(--text)',
        border: published ? '1px solid var(--accent)' : 'none',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 500,
        color: published ? 'var(--accent)' : 'var(--bg)',
        cursor: busy ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: busy ? 0.6 : 1,
      }}>
        {busy ? '...' : published ? 'снять с публикации' : 'опубликовать'}
      </button>
      {error && (
        <span style={{
          fontSize: '10px', color: 'var(--danger)',
          maxWidth: '140px', textAlign: 'right',
        }}>
          {error}
        </span>
      )}
    </div>
  )
}
