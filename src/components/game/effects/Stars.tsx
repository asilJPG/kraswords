import type { ThemeConfig } from '@/lib/crossword/types'

export default function Stars({ theme }: { theme: ThemeConfig }) {
  if (theme.effect !== 'stars') return null
  const color = theme.particleColor || theme.accentColor || '#fff'
  const stars = Array(40).fill(0).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 1.5 + Math.random() * 3,
    size: 1 + Math.random() * 2.5,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          background: color,
          borderRadius: '50%',
          boxShadow: `0 0 ${s.size * 3}px ${color}`,
          animation: `twinkle ${s.duration}s ${s.delay}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}
