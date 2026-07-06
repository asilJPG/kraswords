'use client'

import type { ThemeConfig } from '@/lib/crossword/types'

interface Props {
  theme: ThemeConfig
  isDark: boolean
  onCheck: () => void
  onReset: () => void
  onHint: () => void
  hintsLeft: number
}

export default function GameControls({ theme, isDark, onCheck, onReset, onHint, hintsLeft }: Props) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <button
        onClick={onHint}
        disabled={hintsLeft <= 0}
        style={{
          padding: '10px 14px',
          background: isDark ? theme.accentColor + '18' : '#f3f4f6',
          border: `1px solid ${isDark ? theme.accentColor + '35' : '#e5e7eb'}`,
          borderRadius: '10px',
          color: isDark ? theme.accentColor : '#374151',
          fontSize: '13px',
          fontWeight: 500,
          cursor: hintsLeft > 0 ? 'pointer' : 'not-allowed',
          opacity: hintsLeft > 0 ? 1 : 0.4,
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
      >
        💡 {hintsLeft}
      </button>
      <button
        onClick={onCheck}
        style={{
          flex: 1,
          padding: '10px',
          background: isDark ? theme.accentColor + '18' : '#f3f4f6',
          border: `1px solid ${isDark ? theme.accentColor + '35' : '#e5e7eb'}`,
          borderRadius: '10px',
          color: isDark ? theme.accentColor : '#374151',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
      >
        проверить
      </button>
      <button
        onClick={onReset}
        style={{
          padding: '10px 16px',
          background: 'transparent',
          border: `1px solid ${isDark ? theme.accentColor + '20' : '#e5e7eb'}`,
          borderRadius: '10px',
          color: theme.mutedColor,
          fontSize: '13px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
      >
        сброс
      </button>
    </div>
  )
}
