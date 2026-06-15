'use client'

import type { ThemeConfig } from '@/lib/crossword/types'

const POSITIONS = {
  'bottom-right': { bottom: '20px', right: '20px' },
  'bottom-left':  { bottom: '20px', left:  '20px' },
  'top-right':    { top:    '70px', right: '20px' }, // below the themed game nav
  'top-left':     { top:    '70px', left:  '20px' },
} as const

export default function CornerObject({ theme }: { theme: ThemeConfig }) {
  const c = theme.cornerObject
  if (!c?.imageUrl) return null

  const pos = POSITIONS[c.position ?? 'bottom-right']
  const size = c.size ?? 120
  const anim =
    c.animation === 'float' ? 'corner-float 3s ease-in-out infinite' :
    c.animation === 'pulse' ? 'corner-pulse 2s ease-in-out infinite' :
    'none'

  return (
    <img
      src={c.imageUrl}
      alt=""
      aria-hidden
      style={{
        position: 'fixed',
        ...pos,
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        pointerEvents: 'none',
        zIndex: 5,
        animation: anim,
        filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.4))',
      }}
    />
  )
}
