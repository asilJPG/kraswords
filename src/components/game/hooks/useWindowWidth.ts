import { useEffect, useState } from 'react'

export function useWindowWidth(fallback = 460) {
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}
