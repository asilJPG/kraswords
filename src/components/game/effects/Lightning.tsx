import type { ThemeConfig } from '@/lib/crossword/types'

export default function Lightning({ theme }: { theme: ThemeConfig }) {
  if (theme.effect !== 'lightning') return null
  const color = theme.particleColor || '#a78bfa'
  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 0,
      background: `radial-gradient(ellipse at 30% 0%, ${color}60 0%, transparent 60%)`,
      animation: 'lightning-flash 8s infinite',
    }} />
  )
}
