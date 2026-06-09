import { crosswords, categories } from '@/lib/crosswords'
import CrosswordList from '@/components/CrosswordList'

export default function Home() {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '48px' }} className="animate-fade-in">
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '-1px',
          marginBottom: '8px',
        }}>
          кроссворды
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '15px' }}>
          тематические. каждый — с уникальным визуалом. выбирай и решай.
        </p>
      </div>

      <CrosswordList crosswords={crosswords} categories={categories} />
    </main>
  )
}
