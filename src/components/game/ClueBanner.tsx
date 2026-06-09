'use client'

import type { Clue, ThemeConfig } from '@/lib/crossword/types'

interface Props {
  clue: Clue
  theme: ThemeConfig
  isDark: boolean
}

export default function ClueBanner({ clue, theme, isDark }: Props) {
  return (
    <div style={{
      background: theme.clueActiveBg,
      borderRadius: '12px',
      padding: '12px 18px',
      marginBottom: '24px',
      fontSize: '14px',
      color: theme.textColor,
      border: `1px solid ${isDark ? theme.accentColor + '25' : '#e5e7eb'}`,
    }}>
      <span style={{
        color: theme.accentColor,
        marginRight: '8px',
        fontWeight: 700,
      }}>
        {clue.number}{clue.direction === 'across' ? '→' : '↓'}
      </span>
      {clue.clue}
    </div>
  )
}
