'use client'

import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'

function getTimeLeft() {
  const target = new Date()
  target.setDate(target.getDate() + 2)
  target.setHours(target.getHours() + 14)
  const diff = target.getTime() - Date.now()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  return `${d}д ${h}ч`
}

export default function EventBanner() {
  const [open, setOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    setTimeLeft(getTimeLeft())
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-indigo-600 rounded-2xl px-4 py-3.5 flex items-center gap-3 mb-4 active:scale-[0.98] transition-transform min-h-[44px]"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <span className="text-white text-sm font-medium flex-1 text-left">
          🎮 Мит через {timeLeft}
        </span>
        <span className="text-white/60 text-xs">подробнее →</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-3xl">🎮</span>
            <h3 className="text-xl font-semibold mt-2">Кроссворд-мит</h3>
            <p className="text-gray-400 text-sm mt-1">совместное решение в реальном времени</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">когда</span>
              <span className="font-medium">через {timeLeft}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">формат</span>
              <span className="font-medium">онлайн</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">участников</span>
              <span className="font-medium">12 / 20</span>
            </div>
          </div>
          <button className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-medium text-sm min-h-[44px] active:scale-[0.98] transition-transform">
            записаться
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
