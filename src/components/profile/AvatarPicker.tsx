'use client'

import { useState } from 'react'

const EMOJIS = [
  '😎', '🤓', '🧠', '🧙', '🧑‍🚀', '🥷', '🤖', '👾', '👻', '🦄',
  '🦊', '🐱', '🐺', '🐸', '🦉', '🐲', '🦖', '🐙', '🦋', '🐝',
  '🎃', '🌚', '🌝', '⭐', '🔥', '⚡', '💀', '👑', '🎩', '🪐',
]

interface Props {
  current: string
  onSave: (emoji: string) => Promise<void>
  onClose: () => void
}

export default function AvatarPicker({ current, onSave, onClose }: Props) {
  const [picked, setPicked] = useState(current)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await onSave(picked)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
      setBusy(false)
    }
  }

  return (
    <div
      onClick={onClose}
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
          width: '100%', maxWidth: '420px',
          background: 'var(--bg)', color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '20px 20px 16px',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>выбери аватар</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)', color: 'var(--text)', border: 'none',
              borderRadius: '8px', padding: '6px 10px', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >✕</button>
        </div>

        {/* Preview */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '4px', marginBottom: '16px',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--surface)', border: '3px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
          }}>{picked}</div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '6px',
          marginBottom: '16px',
        }}>
          {EMOJIS.map(e => {
            const active = e === picked
            return (
              <button
                key={e}
                onClick={() => setPicked(e)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: active ? '2px solid var(--accent)' : '2px solid transparent',
                  background: active ? 'var(--accent-soft)' : 'var(--surface)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {e}
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{
            padding: '10px 12px', borderRadius: '10px',
            background: 'var(--danger-soft)', color: 'var(--danger)',
            border: '1px solid var(--danger-border)',
            fontSize: '12px', marginBottom: '12px',
          }}>{error}</div>
        )}

        <button
          onClick={submit}
          disabled={busy || picked === current}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'var(--text)', color: 'var(--bg)',
            border: 'none', fontSize: '14px', fontWeight: 600,
            cursor: busy || picked === current ? 'not-allowed' : 'pointer',
            opacity: busy || picked === current ? 0.5 : 1,
            fontFamily: 'inherit', minHeight: '48px',
          }}
        >
          {busy ? 'сохраняем...' : 'сохранить'}
        </button>
      </div>
    </div>
  )
}
