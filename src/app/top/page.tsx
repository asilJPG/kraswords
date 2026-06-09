import { crosswords } from '@/lib/crosswords'
import Link from 'next/link'

export default function TopPage() {
  const sorted = [...crosswords].sort((a, b) => b.solvers - a.solvers)

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '6px' }}>
        топ кроссвордов
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '32px' }}>
        по количеству решивших
      </p>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #f3f4f6',
        overflow: 'hidden',
      }}>
        {sorted.map((cw, i) => (
          <Link key={cw.id} href={`/play/${cw.id}`}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: i < sorted.length - 1 ? '1px solid #f9fafb' : 'none',
              gap: '14px',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}>
              <span style={{
                width: '28px',
                fontSize: i < 3 ? '18px' : '14px',
                fontWeight: 700,
                color: i < 3 ? '#111827' : '#d1d5db',
                textAlign: 'center',
              }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </span>
              <span style={{ fontSize: '22px' }}>{cw.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 500 }}>{cw.title}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{cw.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {cw.solvers.toLocaleString('ru')}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>решили</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
