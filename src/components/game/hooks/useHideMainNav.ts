import { useEffect } from 'react'

export function useHideMainNav() {
  useEffect(() => {
    const mainNav = document.querySelector('[data-main-nav]') as HTMLElement | null
    if (mainNav) mainNav.style.display = 'none'
    return () => {
      if (mainNav) mainNav.style.display = ''
    }
  }, [])
}
