import Link from 'next/link'
import type { CrosswordData } from '@/lib/crossword/types'

/**
 * Hero card for "Кроссворд дня" on home page.
 * Layout:
 *   - Desktop (≥640px): wide hero JPG fills right half as background, text overlay left
 *   - Mobile (<640px): portrait hero JPG as full background, text overlay bottom-left
 * Falls back gracefully when theme has no heroImage.
 */
export default function FeaturedCard({ crossword }: { crossword: CrosswordData }) {
  const { theme } = crossword
  const hero = theme.heroImage
  const accent = theme.accentColor

  return (
    <Link href={`/play/${crossword.id}`} className="featured-card animate-fade-in" style={{
      display: 'block',
      marginBottom: '36px',
      borderRadius: '24px',
      overflow: 'hidden',
      position: 'relative',
      background: '#0a0a0a',
      minHeight: '420px',
      cursor: 'pointer',
      isolation: 'isolate',
    }}>
      {/* Hero image — wide (desktop) */}
      {hero?.wide && (
        <img
          src={hero.wide}
          alt=""
          aria-hidden
          className="featured-hero-wide"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'right center',
          }}
        />
      )}

      {/* Hero image — portrait (mobile) — separate img so we don't reload on resize */}
      {hero?.portrait && (
        <img
          src={hero.portrait}
          alt=""
          aria-hidden
          className="featured-hero-portrait"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'right center',
          }}
        />
      )}

      {/* Left-to-right dark gradient for text readability over any hero */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0) 65%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '40px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '420px',
        maxWidth: '60%',
      }}>
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: accent,
            marginBottom: '14px',
            letterSpacing: '-0.2px',
          }}>
            Кроссворд дня
          </div>
          <h2 style={{
            fontSize: 'clamp(38px, 7vw, 72px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 0.95,
            letterSpacing: '-2px',
            margin: 0,
          }}>
            {crossword.title}
          </h2>
        </div>

        <div>
          <p style={{
            fontSize: '14px',
            color: accent,
            opacity: 0.85,
            marginBottom: '18px',
          }}>
            {crossword.category} {crossword.wordCount} слов
          </p>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 26px',
            borderRadius: '999px',
            background: accent,
            color: '#0a0a0a',
            fontSize: '16px',
            fontWeight: 700,
            boxShadow: `0 6px 20px ${accent}50`,
          }}>
            играть →
          </span>
        </div>
      </div>
    </Link>
  )
}
