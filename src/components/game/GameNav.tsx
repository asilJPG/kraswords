'use client'

import Link from 'next/link'
import type { ThemeConfig } from '@/lib/crossword/types'
import { formatTime } from '@/lib/crossword/format'

interface Props {
  theme: ThemeConfig
  emoji: string
  title: string
  timer: number
  solved: boolean
}

export default function GameNav({ theme, emoji, title, timer, solved }: Props) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: theme.navBg,
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${theme.navBorder}`,
    }}>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 20px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          fontSize: '13px',
          color: theme.mutedColor,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          ← назад
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{emoji}</span>
          <span style={{
            fontWeight: 600,
            fontSize: '15px',
            color: theme.textColor,
          }}>
            {title}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: solved ? '#22c55e' : theme.textColor,
          }}>
            {formatTime(timer)}
          </div>
        </div>
      </div>
    </nav>
  )
}
