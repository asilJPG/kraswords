import CrosswordList from '@/components/CrosswordList'
import Link from 'next/link'
import { fetchPublishedCrosswords } from '@/lib/crossword/server-api'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const crosswords = await fetchPublishedCrosswords()
  const categories = [...new Set(crosswords.map(c => c.category))]
  const featured = crosswords[0]
  const topByVisits = [...crosswords].sort((a, b) => b.solvers - a.solvers).slice(0, 3)

  if (!featured) {
    return (
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>пока пусто</h1>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>
          скоро появятся первые кроссворды
        </p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 40px' }}>
      <div style={{ marginBottom: '36px' }} className="animate-fade-in">
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '-1px',
          marginBottom: '6px',
        }}>
          кроссворды
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>
          тематические. каждый — с уникальным визуалом. выбирай и решай.
        </p>
      </div>

      {/* featured / main crossword */}
      <Link href={`/play/${featured.id}`}>
        <div className="card-hover animate-fade-in" style={{
          background: featured.theme.bgImage || featured.theme.bg,
          borderRadius: '20px',
          padding: '28px 24px',
          marginBottom: '36px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          border: `1px solid ${featured.theme.accentColor}30`,
          boxShadow: featured.theme.glowColor
            ? `0 4px 30px ${featured.theme.glowColor}20`
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          {featured.theme.glowColor && (
            <div style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${featured.theme.glowColor}15 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: featured.theme.accentColor,
              marginBottom: '12px',
            }}>
              кроссворд дня
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>{featured.emoji}</span>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: featured.theme.textColor,
                fontFamily: featured.theme.fontFamily || 'inherit',
              }}>
                {featured.title}
              </h2>
            </div>
            <p style={{
              fontSize: '13px',
              color: featured.theme.mutedColor,
              marginBottom: '16px',
            }}>
              {featured.category} · {featured.author} · {featured.wordCount} слов
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: featured.theme.accentColor + '20',
              color: featured.theme.accentColor,
              fontSize: '13px',
              fontWeight: 600,
            }}>
              играть →
            </div>
          </div>
        </div>
      </Link>

      {/* top by visits */}
      <div style={{ marginBottom: '36px' }} className="animate-fade-in">
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '14px',
          color: '#6b7280',
        }}>
          популярные
        </h2>
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}>
          {topByVisits.map(cw => (
            <Link key={cw.id} href={`/play/${cw.id}`}>
              <div style={{
                minWidth: '160px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#f9fafb',
                border: '1px solid #f3f4f6',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{cw.emoji}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{cw.title}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {cw.solvers.toLocaleString('ru')} решили
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* all crosswords */}
      <CrosswordList crosswords={crosswords} categories={categories} />
    </main>
  )
}
