import type { ThemeConfig } from '@/lib/crossword/types'

export default function MagicSparkles({ theme }: { theme: ThemeConfig }) {
  if (theme.id !== 'harrypotter') return null
  const sparkles = Array(18).fill(0).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 2 + Math.random() * 3,
    size: 3 + Math.random() * 5,
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {sparkles.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          background: theme.particleColor,
          borderRadius: '50%',
          boxShadow: `0 0 ${s.size * 2}px ${theme.particleColor}`,
          animation: `sparkle ${s.duration}s ${s.delay}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}
