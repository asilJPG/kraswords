'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PlayerEntry {
  username: string
  total: number
  avg: number
}

interface CrosswordEntry {
  id: string
  title: string
  emoji: string
  category: string
  solvers: number
}

const PAGE_SIZE = 10

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

export default function TopClient({ players, crosswords }: { players: PlayerEntry[]; crosswords: CrosswordEntry[] }) {
  const [tab, setTab] = useState<'players' | 'crosswords'>('players')
  const [page, setPage] = useState(0)

  const data = tab === 'players' ? players : crosswords
  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const slice = data.slice(start, start + PAGE_SIZE)

  const switchTab = (t: 'players' | 'crosswords') => {
    setTab(t)
    setPage(0)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--surface)', borderRadius: '12px', padding: '4px' }}>
        <button
          onClick={() => switchTab('players')}
          style={{
            flex: 1, padding: '10px 0', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600, transition: 'all .2s',
            background: tab === 'players' ? 'var(--bg)' : 'transparent',
            color: tab === 'players' ? 'var(--text)' : 'var(--text-light)',
            boxShadow: tab === 'players' ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
          }}
        >
          игроки
        </button>
        <button
          onClick={() => switchTab('crosswords')}
          style={{
            flex: 1, padding: '10px 0', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600, transition: 'all .2s',
            background: tab === 'crosswords' ? 'var(--bg)' : 'transparent',
            color: tab === 'crosswords' ? 'var(--text)' : 'var(--text-light)',
            boxShadow: tab === 'crosswords' ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
          }}
        >
          кроссворды
        </button>
      </div>

      <div style={{ background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {slice.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '14px' }}>
            {tab === 'players' ? 'пока никто не решал' : 'пока нет кроссвордов'}
          </div>
        ) : slice.map((item, i) => {
          const rank = start + i
          const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null

          if (tab === 'players') {
            const p = item as PlayerEntry
            return (
              <div key={p.username} style={{
                display: 'flex', alignItems: 'center', padding: '14px 20px',
                borderBottom: i < slice.length - 1 ? '1px solid var(--border)' : 'none',
                gap: '12px',
              }}>
                <span style={{ width: '24px', fontSize: medal ? '16px' : '13px', fontWeight: 700, color: medal ? 'var(--text)' : 'var(--text-light)', textAlign: 'center' }}>
                  {medal ?? rank + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{p.username}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{p.total} <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '12px' }}>реш.</span></div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>ср. {fmt(p.avg)}</div>
                </div>
              </div>
            )
          }

          const cw = item as CrosswordEntry
          return (
            <Link key={cw.id} href={`/play/${cw.id}`}>
              <div style={{
                display: 'flex', alignItems: 'center', padding: '14px 20px',
                borderBottom: i < slice.length - 1 ? '1px solid var(--border)' : 'none',
                gap: '12px', cursor: 'pointer',
              }}>
                <span style={{ width: '24px', fontSize: medal ? '16px' : '13px', fontWeight: 700, color: medal ? 'var(--text)' : 'var(--text-light)', textAlign: 'center' }}>
                  {medal ?? rank + 1}
                </span>
                <span style={{ fontSize: '20px' }}>{cw.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{cw.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{cw.category}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{cw.solvers.toLocaleString('ru')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>решили</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            style={{
              padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: page === 0 ? 'var(--text-light)' : 'var(--text)',
              cursor: page === 0 ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600,
              opacity: page === 0 ? 0.5 : 1,
            }}
          >
            ←
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
            style={{
              padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: page >= totalPages - 1 ? 'var(--text-light)' : 'var(--text)',
              cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600,
              opacity: page >= totalPages - 1 ? 0.5 : 1,
            }}
          >
            →
          </button>
        </div>
      )}
    </>
  )
}
