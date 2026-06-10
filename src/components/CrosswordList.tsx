'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CrosswordData, getDifficultyColor, getDifficultyBg } from '@/lib/crosswords'

function ThemePreview({ theme }: { theme: CrosswordData['theme'] }) {
  return (
    <div style={{
      width: '100%',
      height: '120px',
      borderRadius: '12px 12px 0 0',
      background: theme.bgImage || theme.bg,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: '3px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {Array(12).fill(0).map((_, i) => (
        <div key={i} style={{
          borderRadius: '3px',
          background: [2, 5, 9].includes(i)
            ? theme.blackCellBg
            : theme.cellBg,
          border: `1px solid ${[2, 5, 9].includes(i) ? 'transparent' : theme.cellBorder}`,
          opacity: 0.8,
        }} />
      ))}
      {theme.glowColor && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '40px',
          background: `radial-gradient(ellipse, ${theme.glowColor}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}

interface CardDecor {
  divider: string
  image: string    // path in /cards/
  imagePos: 'bottom-right' | 'bottom-left'
  imageSize: number
}

const cardDecors: Record<string, CardDecor> = {
  // Rick & Morty
  '1': {
    divider: `<path d="M0,6 Q30,6 40,14 Q50,22 60,8 Q75,0 90,10 Q105,20 120,6 Q135,0 150,12 Q165,22 180,8 Q195,0 210,14 Q225,24 240,8 Q255,0 270,10 Q285,18 300,6" fill="none" stroke="#39ff14" stroke-width="2.5" opacity="0.5"/><ellipse cx="40" cy="22" rx="3" ry="5" fill="#39ff14" opacity="0.25"/><ellipse cx="150" cy="24" rx="2.5" ry="4" fill="#39ff14" opacity="0.2"/><ellipse cx="240" cy="23" rx="2" ry="4.5" fill="#39ff14" opacity="0.3"/>`,
    image: 'rm-pickle-rick.png',
    imagePos: 'bottom-right',
    imageSize: 72,
  },
  '2': {
    divider: `<line x1="0" y1="14" x2="300" y2="14" stroke="#39ff14" stroke-width="0.5" opacity="0.2"/><path d="M80,4 L85,14 L80,24" fill="none" stroke="#39ff14" stroke-width="1.5" opacity="0.5"/><path d="M150,2 L155,14 L150,26" fill="none" stroke="#39ff14" stroke-width="1.5" opacity="0.4"/><path d="M220,4 L225,14 L220,24" fill="none" stroke="#39ff14" stroke-width="1.5" opacity="0.5"/><circle cx="85" cy="14" r="2" fill="#39ff14" opacity="0.3"/><circle cx="155" cy="14" r="2" fill="#39ff14" opacity="0.3"/><circle cx="225" cy="14" r="2" fill="#39ff14" opacity="0.3"/>`,
    image: 'rm-evil-morty.png',
    imagePos: 'bottom-right',
    imageSize: 68,
  },
  '3': {
    divider: `<line x1="0" y1="14" x2="300" y2="14" stroke="#39ff14" stroke-width="0.5" opacity="0.2"/><ellipse cx="80" cy="14" rx="12" ry="8" fill="none" stroke="#39ff14" stroke-width="1.2" opacity="0.35"/><ellipse cx="150" cy="14" rx="8" ry="10" fill="none" stroke="#39ff14" stroke-width="1" opacity="0.25"/><circle cx="80" cy="14" r="3" fill="#39ff14" opacity="0.15"/><circle cx="220" cy="14" r="2" fill="#39ff14" opacity="0.3"/>`,
    image: 'rm-portal-gun.png',
    imagePos: 'bottom-left',
    imageSize: 65,
  },

  // Harry Potter
  '4': {
    divider: `<rect y="12" width="300" height="2" fill="#c8a45a" opacity="0.15"/><line x1="100" y1="14" x2="200" y2="14" stroke="#c8a45a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="203" cy="14" rx="3" ry="2" fill="#c8a45a"/><line x1="97" y1="8" x2="104" y2="14" stroke="#c8a45a" stroke-width="1.5" stroke-linecap="round"/><line x1="95" y1="11" x2="102" y2="14" stroke="#c8a45a" stroke-width="1.5" stroke-linecap="round"/><line x1="97" y1="20" x2="104" y2="14" stroke="#c8a45a" stroke-width="1.5" stroke-linecap="round"/><line x1="95" y1="17" x2="102" y2="14" stroke="#c8a45a" stroke-width="1.5" stroke-linecap="round"/><circle cx="140" cy="8" r="1.2" fill="#ffd700" opacity="0.6"/><circle cx="170" cy="20" r="1" fill="#ffd700" opacity="0.4"/>`,
    image: 'hp-sorting-hat.png',
    imagePos: 'bottom-right',
    imageSize: 70,
  },
  '5': {
    divider: `<rect y="13" width="300" height="1" fill="#c8a45a" opacity="0.15"/><line x1="120" y1="14" x2="180" y2="14" stroke="#c8a45a" stroke-width="2" stroke-linecap="round" opacity="0.6"/><circle cx="124" cy="14" r="3" fill="none" stroke="#c8a45a" stroke-width="1" opacity="0.4"/><circle cx="176" cy="14" r="3" fill="none" stroke="#c8a45a" stroke-width="1" opacity="0.4"/><circle cx="150" cy="8" r="1.5" fill="#ffd700" opacity="0.5"/><circle cx="150" cy="20" r="1.5" fill="#ffd700" opacity="0.5"/>`,
    image: 'hp-wand.png',
    imagePos: 'bottom-left',
    imageSize: 65,
  },
  '6': {
    divider: `<rect y="13" width="300" height="1" fill="#c8a45a" opacity="0.1"/><path d="M100,8 Q120,14 100,20" fill="none" stroke="#c8a45a" stroke-width="1.5" opacity="0.4"/><path d="M200,8 Q180,14 200,20" fill="none" stroke="#c8a45a" stroke-width="1.5" opacity="0.4"/><circle cx="150" cy="14" r="5" fill="none" stroke="#c8a45a" stroke-width="1" opacity="0.25"/><circle cx="150" cy="14" r="2" fill="#c8a45a" opacity="0.15"/>`,
    image: 'hp-deathly-hallows.png',
    imagePos: 'bottom-right',
    imageSize: 60,
  },

}

function CrosswordCard({ cw }: { cw: CrosswordData }) {
  const decor = cardDecors[cw.id]

  return (
    <Link href={`/play/${cw.id}`}>
      <div
        className="card-hover animate-fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <ThemePreview theme={cw.theme} />

        {/* per-crossword divider */}
        {decor ? (
          <div style={{ position: 'relative', height: '28px', marginTop: '-14px', zIndex: 2 }}>
            <svg
              width="100%"
              height="28"
              viewBox="0 0 300 28"
              preserveAspectRatio="none"
              style={{ display: 'block', width: '100%' }}
              dangerouslySetInnerHTML={{ __html: decor.divider }}
            />
          </div>
        ) : (
          <div style={{ height: '1px', background: '#f3f4f6' }} />
        )}

        <div style={{ padding: '16px 20px 20px', position: 'relative' }}>
          {/* per-crossword character image peeking from corner */}
          {decor && (
            <img
              src={`/cards/${decor.image}`}
              alt=""
              style={{
                position: 'absolute',
                ...(decor.imagePos === 'bottom-right'
                  ? { bottom: '-6px', right: '-6px' }
                  : { bottom: '-6px', left: '-6px' }),
                width: `${decor.imageSize}px`,
                height: `${decor.imageSize}px`,
                objectFit: 'contain',
                opacity: 0.8,
                pointerEvents: 'none',
                zIndex: 0,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              }}
            />
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{cw.emoji}</span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.3px',
              }}>
                {cw.title}
              </h3>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 8px',
              borderRadius: '6px',
              background: getDifficultyBg(cw.difficulty),
              color: getDifficultyColor(cw.difficulty),
            }}>
              {cw.difficulty}
            </span>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '12px',
            position: 'relative',
            zIndex: 1,
          }}>
            {cw.category}
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#d1d5db',
            position: 'relative',
            zIndex: 1,
          }}>
            <span>{cw.wordCount} слов</span>
            <span>{cw.size}×{cw.size}</span>
            <span>{cw.solvers.toLocaleString('ru')} решили</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CrosswordList({
  crosswords,
  categories,
}: {
  crosswords: CrosswordData[]
  categories: string[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? crosswords.filter(c => c.category === activeCategory)
    : crosswords

  return (
    <>
      <div className="category-filters" style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: activeCategory === null ? 500 : 400,
            border: 'none',
            background: activeCategory === null ? '#111827' : '#f3f4f6',
            color: activeCategory === null ? '#ffffff' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          все
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: activeCategory === cat ? 500 : 400,
              border: 'none',
              background: activeCategory === cat ? '#111827' : '#f3f4f6',
              color: activeCategory === cat ? '#ffffff' : '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {filtered.map(cw => (
          <CrosswordCard key={cw.id} cw={cw} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#d1d5db',
          fontSize: '14px',
        }}>
          пока пусто
        </div>
      )}
    </>
  )
}
