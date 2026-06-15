'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeEditor, { DEFAULT_THEME, type ThemeConfigDraft } from './ThemeEditor'

interface Props {
  mode: 'create' | 'edit'
  initialId?: string
  initialName?: string
  initialConfig?: ThemeConfigDraft
}

export default function ThemeForm({ mode, initialId, initialName, initialConfig }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName ?? '')
  const [config, setConfig] = useState<ThemeConfigDraft>(initialConfig ?? DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setError(null)
    if (name.trim().length < 1) {
      setError('Имя темы обязательно')
      return
    }
    setSaving(true)
    try {
      const url = mode === 'create' ? '/api/admin/themes' : `/api/admin/themes/${initialId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), config }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Ошибка сохранения')
        return
      }
      router.push('/admin/themes')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block' }}>
          <span style={{
            display: 'block', fontSize: '10px', textTransform: 'uppercase',
            letterSpacing: '0.5px', color: 'var(--text-light)', fontWeight: 600, marginBottom: '4px',
          }}>Имя темы</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="например: Пацаны"
            maxLength={60}
            style={{
              width: '100%', padding: '10px 12px', fontSize: '14px',
              background: 'var(--bg)', color: 'var(--text)',
              border: '1px solid var(--border)', borderRadius: '10px',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        </label>
      </div>

      <ThemeEditor value={config} onChange={setConfig} />

      {error && (
        <div style={{
          marginTop: '16px', padding: '10px 12px', borderRadius: '10px',
          background: 'var(--danger-soft)', color: 'var(--danger)',
          fontSize: '12px', border: '1px solid var(--danger-border)',
        }}>{error}</div>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{
          marginTop: '20px', padding: '12px 20px', borderRadius: '12px',
          background: 'var(--text)', color: 'var(--bg)',
          border: 'none', fontSize: '14px', fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      >
        {saving ? 'сохраняем…' : mode === 'create' ? 'создать тему' : 'сохранить'}
      </button>
    </div>
  )
}
