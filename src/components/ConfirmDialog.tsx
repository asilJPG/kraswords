'use client'

import { useEffect } from 'react'

interface Props {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'подтвердить',
  cancelLabel = 'отмена',
  variant = 'default',
  busy = false,
  onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
      if (e.key === 'Enter' && !busy) onConfirm()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, busy, onConfirm, onCancel])

  if (!open) return null

  const dangerBg = variant === 'danger' ? 'var(--danger)' : 'var(--text)'

  return (
    <div
      onClick={() => { if (!busy) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '380px',
          background: 'var(--bg)', color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '22px',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: message ? '6px' : '16px' }}>
          {title}
        </h3>
        {message && (
          <p style={{
            fontSize: '13px', color: 'var(--text-light)',
            marginBottom: '18px', lineHeight: 1.4,
          }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
              opacity: busy ? 0.5 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            style={{
              flex: 1,
              padding: '12px',
              background: dangerBg,
              color: 'var(--bg)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
