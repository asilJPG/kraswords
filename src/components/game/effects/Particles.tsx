import type { ThemeConfig } from '@/lib/crossword/types'
import { useClientRandom } from './useClientRandom'

export default function Particles({ theme }: { theme: ThemeConfig }) {
  const particles = useClientRandom(() => Array(30).fill(0).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.3,
  })))
  if (!theme.particleColor && theme.effect !== 'particles') return null

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: theme.particleColor || theme.accentColor || '#fff',
          opacity: p.opacity,
          animation: `twinkle ${p.duration}s ${p.delay}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}
