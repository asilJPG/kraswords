'use client'

import { useEffect, useState } from 'react'

interface GameEvent {
  id: string
  title: string
  emoji: string
  description: string
  date: string
  theme: string
  active: boolean
}

const mockEvents: GameEvent[] = [
  {
    id: '1',
    title: 'Портальный марафон',
    emoji: '🧪',
    description: 'Решаем все кроссворды по Рик и Морти на скорость. Топ-3 получат ачивку.',
    date: '2026-06-12T19:00:00',
    theme: 'Рик и Морти',
    active: false,
  },
  {
    id: '2',
    title: 'Магический вечер',
    emoji: '⚡',
    description: 'Кроссворды по Гарри Поттеру в режиме без подсказок. Только для волшебников.',
    date: '2026-06-15T18:00:00',
    theme: 'Гарри Поттер',
    active: false,
  },
  {
    id: '3',
    title: 'Ночь ретро',
    emoji: '👾',
    description: 'Пиксельные кроссворды, музыка 8-bit, ностальгия по полной.',
    date: '2026-06-20T21:00:00',
    theme: 'Ретро',
    active: false,
  },
]

function Countdown({ date }: { date: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(date).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('сейчас!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(`${d}д ${h}ч ${m}м`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [date])

  return <span>{timeLeft}</span>
}

export default function EventsPage() {
  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '8px' }}>
        ивенты
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '40px' }}>
        совместные решения кроссвордов. приходи — будет весело.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mockEvents.map(event => (
          <div key={event.id} style={{
            background: '#ffffff',
            border: '1px solid #f3f4f6',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {event.active && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e80',
              }} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>{event.emoji}</span>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{event.title}</h2>
                <span style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  background: '#f3f4f6',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  {event.theme}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
              {event.description}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                {new Date(event.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <Countdown date={event.date} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
