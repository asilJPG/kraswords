import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_COOKIE, ADMIN_TOKEN } from '@/lib/admin-auth'
import LogoutButton from '@/components/admin/LogoutButton'
import HideMainNav from '@/components/admin/HideMainNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAdminCookie = cookieStore.get(ADMIN_COOKIE)?.value === ADMIN_TOKEN

  let displayName: string = 'admin'
  if (!isAdminCookie) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/admin')
    displayName = user.email ?? 'admin'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <HideMainNav />

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 20px', height: '56px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <Link href="/admin" style={{ fontWeight: 700, fontSize: '15px' }}>
            красвордс <span style={{ color: '#9ca3af', fontWeight: 400 }}>· админ</span>
          </Link>
          <Link href="/admin" style={navLink}>кроссворды</Link>
          <Link href="/admin/new" style={navLink}>+ новый</Link>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>{displayName}</span>
          <LogoutButton isAdminCookie={isAdminCookie} />
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px' }}>
        {children}
      </main>
    </div>
  )
}

const navLink: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  padding: '6px 10px',
  borderRadius: '8px',
}
