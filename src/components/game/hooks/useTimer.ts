import { useEffect, useState } from 'react'

export function useTimer(running: boolean, frozen: boolean) {
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (!running || frozen) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [running, frozen])

  const reset = () => setTimer(0)
  return { timer, reset }
}
