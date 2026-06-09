'use client'

import { useEffect } from 'react'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mainNav = document.querySelector('[data-main-nav]') as HTMLElement | null
    if (mainNav) mainNav.style.display = 'none'
    return () => {
      if (mainNav) mainNav.style.display = ''
    }
  }, [])
  return <>{children}</>
}
