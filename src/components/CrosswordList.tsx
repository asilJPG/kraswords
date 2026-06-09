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

function CrosswordCard({ cw, index }: { cw: CrosswordData; index: number }) {
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
          animationDelay: `${index * 0.06}s`,
        }}
      >
        <ThemePreview theme={cw.theme} />

        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
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
          }}>
            {cw.category} · {cw.author}
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#d1d5db',
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
      <div style={{
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
        {filtered.map((cw, i) => (
          <CrosswordCard key={cw.id} cw={cw} index={i} />
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
