import CrosswordList from '@/components/CrosswordList'
import FeaturedCard from '@/components/FeaturedCard'
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
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
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
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
          тематические. каждый — с уникальным визуалом. выбирай и решай.
        </p>
      </div>

      {/* featured / main crossword */}
      <FeaturedCard crossword={featured} />

      {/* top by visits */}
      <div style={{ marginBottom: '36px' }} className="animate-fade-in">
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '14px',
          color: 'var(--text-secondary)',
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
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{cw.emoji}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{cw.title}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
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
