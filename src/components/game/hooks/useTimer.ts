import { useEffect, useRef, useState } from 'react'

// Считает от таймстампов, а не от тиков setInterval: в фоновой вкладке
// интервалы троттлятся и время занижалось.
export function useTimer(running: boolean, frozen: boolean) {
  const [timer, setTimer] = useState(0)
  const baseRef = useRef(0)                    // накопленные секунды до паузы
  const startRef = useRef<number | null>(null) // старт текущего отрезка

  useEffect(() => {
    if (!running || frozen) return
    startRef.current = Date.now()
    const tick = () => {
      if (startRef.current === null) return
      setTimer(Math.floor(baseRef.current + (Date.now() - startRef.current) / 1000))
    }
    const interval = setInterval(tick, 500)
    return () => {
      clearInterval(interval)
      if (startRef.current !== null) {
        baseRef.current += (Date.now() - startRef.current) / 1000
        startRef.current = null
      }
    }
  }, [running, frozen])

  const reset = () => {
    baseRef.current = 0
    if (startRef.current !== null) startRef.current = Date.now()
    setTimer(0)
  }
  return { timer, reset }
}
