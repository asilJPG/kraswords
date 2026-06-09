import { crosswords } from '@/lib/crosswords'

const mockLeaders = [
  { name: '😎 макс', time: '2:14', crosswords: 6 },
  { name: '🧠 аня', time: '2:31', crosswords: 5 },
  { name: '🔥 дима', time: '3:05', crosswords: 6 },
  { name: '💀 катя', time: '3:12', crosswords: 4 },
  { name: '🎯 олег', time: '3:45', crosswords: 5 },
  { name: '🌟 лиза', time: '4:01', crosswords: 3 },
  { name: '🎮 артём', time: '4:22', crosswords: 4 },
  { name: '🧩 ира', time: '4:50', crosswords: 3 },
]

export default function TopPage() {
  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '8px' }}>
        топ игроков
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '40px' }}>
        лучшие по среднему времени решения
      </p>

      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #f3f4f6',
        overflow: 'hidden',
      }}>
        {mockLeaders.map((leader, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: i < mockLeaders.length - 1 ? '1px solid #f9fafb' : 'none',
            gap: '16px',
          }}>
            <span style={{
              width: '28px',
              fontSize: '14px',
              fontWeight: 700,
              color: i < 3 ? '#111827' : '#d1d5db',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: '16px', flex: 1, fontWeight: 500 }}>
              {leader.name}
            </span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>
              {leader.crosswords} решено
            </span>
            <span style={{
              fontSize: '15px',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: i === 0 ? '#111827' : '#6b7280',
            }}>
              {leader.time}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '48px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          по кроссвордам
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {crosswords.map(cw => (
            <div key={cw.id} style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{cw.emoji}</div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{cw.title}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                лучшее: 1:42
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
