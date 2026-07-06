import { useEffect, useState } from 'react'

// Math.random() в рендере даёт hydration mismatch (SSR ≠ клиент) и новые
// позиции на каждый ререндер. Генерим массив один раз после маунта;
// на сервере и первом клиентском рендере — пусто.
export function useClientRandom<T>(make: () => T[]): T[] {
  const [items, setItems] = useState<T[]>([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setItems(make()) }, [])
  return items
}
