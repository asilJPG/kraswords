'use client'

import { useEffect, useMemo, useState } from 'react'
import BottomSheet from './BottomSheet'
import { ACHIEVEMENTS, getAchievementProgress } from '@/lib/gameHistory'

interface Props {
  open: boolean
  onClose: () => void
  time: number
  rank: number | null
  crosswordTitle: string
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

const CONFETTI_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb7185']

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 36 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 1.8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    })),
    []
  )
  return (
    <div style={{
      position: 'absolute',
      top: '-40px', left: '-20px', right: '-20px', bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 0,
          left: `${p.left}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          background: p.color,
          borderRadius: '2px',
          transform: `rotate(${p.rotate}deg)`,
          animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

export default function ResultSheet({
  open, onClose, time, rank, crosswordTitle,
}: Props) {
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!open) { setStage(0); return }
    setProgress(getAchievementProgress())
    const t1 = setTimeout(() => setStage(1), 250)   // title + subtitle
    const t2 = setTimeout(() => setStage(2), 650)   // stat cards
    const t3 = setTimeout(() => setStage(3), 1100)  // achievements
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [open])

  const unlocked = ACHIEVEMENTS.filter(a => (progress[a.id] ?? 0) >= a.maxProgress)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {open && <Confetti />}

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '4px 0 0' }}>
          <div style={{
            fontSize: '76px',
            lineHeight: 1,
            display: 'inline-block',
            animation: 'bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            filter: 'drop-shadow(0 6px 14px rgba(34,197,94,0.25))',
          }}>
            🎉
          </div>

          <h2 style={{
            fontSize: '26px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: '#16a34a',
            marginTop: '12px',
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s ease-out',
          }}>
            отлично!
          </h2>
          <p style={{
            fontSize: '13px',
            color: '#9ca3af',
            marginTop: '4px',
            opacity: stage >= 1 ? 1 : 0,
            transition: 'opacity 0.4s ease-out 0.1s',
          }}>
            {crosswordTitle}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex',
          gap: '10px',
          marginTop: '22px',
          opacity: stage >= 2 ? 1 : 0,
          transform: stage >= 2 ? 'scale(1)' : 'scale(0.92)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <StatCard label="время" value={fmt(time)} accent="#3b82f6" />
          {rank !== null && rank !== undefined && (
            <StatCard label="место" value={`#${rank}`} accent="#f59e0b" />
          )}
        </div>

        {/* Achievements */}
        {unlocked.length > 0 && (
          <div style={{
            position: 'relative', zIndex: 1,
            marginTop: '20px',
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? 'translateY(0)' : 'translateY(14px)',
            transition: 'all 0.45s ease-out',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>🏆</span> ачивки разблокированы
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {unlocked.map((a, i) => (
                <div key={a.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid #fcd34d',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  animation: `pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.15 + i * 0.1}s backwards, badge-glow 2.4s ease-in-out ${0.6 + i * 0.1}s infinite`,
                }}>
                  <span style={{ fontSize: '32px', lineHeight: 1 }}>{a.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#78350f' }}>{a.title}</div>
                    <div style={{ fontSize: '12px', color: '#a16207' }}>{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex',
          gap: '10px',
          marginTop: '26px',
          opacity: stage >= 2 ? 1 : 0,
          transition: 'opacity 0.4s ease-out 0.2s',
        }}>
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                  title: 'красвордс',
                  text: `Решил "${crosswordTitle}" за ${fmt(time)}!`,
                }).catch(() => { /* user cancelled */ })
              }
            }}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '48px',
            }}
          >
            поделиться
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '48px',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
            }}
          >
            продолжить →
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{
      flex: 1,
      background: '#fff',
      border: `2px solid ${accent}20`,
      borderRadius: '16px',
      padding: '14px 12px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '26px',
        fontWeight: 800,
        color: accent,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.5px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '10px',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        marginTop: '4px',
        fontWeight: 700,
      }}>
        {label}
      </div>
    </div>
  )
}
