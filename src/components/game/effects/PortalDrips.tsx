import { useMemo } from 'react'
import type { ThemeConfig } from '@/lib/crossword/types'

export default function PortalDrips({ theme }: { theme: ThemeConfig }) {
  if (theme.id !== 'rickmorty' && theme.effect !== 'portal-drips') return null

  const drips = useMemo(() => Array(10).fill(0).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 5 + Math.random() * 4,
    width: 2 + Math.random() * 2,
    height: 30 + Math.random() * 60,
  })), [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {drips.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${d.left}%`,
          top: 0,
          width: `${d.width}px`,
          height: `${d.height}px`,
          background: `linear-gradient(180deg, transparent, ${theme.particleColor}60, transparent)`,
          borderRadius: '2px',
          animation: `drip ${d.duration}s ${d.delay}s infinite linear`,
        }} />
      ))}
    </div>
  )
}
