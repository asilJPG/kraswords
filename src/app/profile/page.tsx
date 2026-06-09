'use client'

import { useState, useEffect } from 'react'
import { getHistory, getTotalSolved, getAverageTime, GameRecord } from '@/lib/gameHistory'
import { crosswords } from '@/lib/crosswords'
import Link from 'next/link'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function ProfilePage() {
  const [history, setHistory] = useState<GameRecord[]>([])
  const [totalSolved, setTotalSolved] = useState(0)
  const [avgTime, setAvgTime] = useState<number | null>(null)

  useEffect(() => {
    setHistory(getHistory())
    setTotalSolved(getTotalSolved())
    setAvgTime(getAverageTime())
  }, [])

  const streak = (() => {
    const solved = history.filter(h => h.solved).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    if (solved.length === 0) return 0
    let count = 1
    for (let i = 1; i < solved.length; i++) {
      const prev = new Date(solved[i - 1].date)
      const curr = new Date(solved[i].date)
      const diffDays = Math.floor((prev.getTime() - curr.getTime()) / 86400000)
      if (diffDays <= 1) count++
      else break
    }
    return count
  })()

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 40px' }}>
      {/* header / banner */}
      <div className="animate-fade-in" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '28px 24px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '30%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            😎
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              игрок
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              на сайте с июня 2026
            </p>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '36px',
      }}>
        {[
          { label: 'решено', value: String(totalSolved) },
          { label: 'среднее', value: avgTime ? formatTime(avgTime) : '—' },
          { label: 'серия', value: String(streak) },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#f9fafb',
            borderRadius: '14px',
            padding: '18px 12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* game history */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>
        история игр
      </h2>
      {history.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#d1d5db',
          fontSize: '14px',
          background: '#f9fafb',
          borderRadius: '14px',
        }}>
          ещё не решал кроссвордов
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #f3f4f6',
          overflow: 'hidden',
        }}>
          {history
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((record, i) => {
              const cw = crosswords.find(c => c.id === record.crosswordId)
              if (!cw) return null
              return (
                <Link key={i} href={`/play/${cw.id}`}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 16px',
                    gap: '12px',
                    borderBottom: i < history.length - 1 ? '1px solid #f9fafb' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}>
                    <span style={{ fontSize: '20px' }}>{cw.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{cw.title}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {new Date(record.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        color: record.solved ? '#22c55e' : '#9ca3af',
                      }}>
                        {record.solved ? formatTime(record.time) : 'не решён'}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
        </div>
      )}
    </main>
  )
}
