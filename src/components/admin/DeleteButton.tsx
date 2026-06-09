'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCrossword } from '@/lib/crossword/api'

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    if (!confirm(`удалить "${title}"?`)) return
    setBusy(true)
    try {
      await deleteCrossword(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button onClick={onClick} disabled={busy} style={{
      padding: '6px 10px',
      background: 'transparent',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#dc2626',
      cursor: busy ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      opacity: busy ? 0.6 : 1,
    }}>
      ×
    </button>
  )
}
