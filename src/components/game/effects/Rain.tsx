import type { ThemeConfig } from '@/lib/crossword/types'
import { useClientRandom } from './useClientRandom'

export default function Rain({ theme }: { theme: ThemeConfig }) {
  const drops = useClientRandom(() => Array(50).fill(0).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 0.6 + Math.random() * 0.7,
    height: 14 + Math.random() * 18,
    opacity: 0.3 + Math.random() * 0.4,
  })))
  if (theme.effect !== 'rain') return null
  const color = theme.particleColor || '#9ca3af'
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {drops.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${d.left}%`,
          top: 0,
          width: '1.5px',
          height: `${d.height}px`,
          background: `linear-gradient(180deg, transparent, ${color})`,
          opacity: d.opacity,
          animation: `rain-fall ${d.duration}s ${d.delay}s infinite linear`,
        }} />
      ))}
    </div>
  )
}
