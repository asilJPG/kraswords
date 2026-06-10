'use client'

import { useEffect, useRef } from 'react'

export default function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }} />
      <div
        ref={ref}
        onClick={e => e.stopPropagation()}
        className="animate-slide-up"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '12px 18px 24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          background: '#e5e7eb',
          borderRadius: '999px',
          margin: '0 auto 12px',
        }} />
        {children}
      </div>
    </div>
  )
}
