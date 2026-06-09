'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'кроссворды', icon: '🧩' },
  { href: '/top', label: 'топ', icon: '🏆' },
  { href: '/events', label: 'ивенты', icon: '📅' },
  { href: '/profile', label: 'профиль', icon: '😎' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav data-main-nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 20px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" className="nav-logo" style={{
          fontWeight: 700,
          fontSize: '18px',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>красвордс</span>
        </Link>

        <div className="nav-links" style={{
          display: 'flex',
          gap: '4px',
        }}>
          {links.map(link => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#111827' : '#9ca3af',
                  background: isActive ? '#f3f4f6' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '14px' }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
