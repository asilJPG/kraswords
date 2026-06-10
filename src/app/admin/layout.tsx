import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/admin-auth'
import LogoutButton from '@/components/admin/LogoutButton'
import HideMainNav from '@/components/admin/HideMainNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')
  if (!(await isUserAdmin(supabase, user.id))) redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      <HideMainNav />

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--surface)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 20px', height: '56px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <Link href="/admin" style={{ fontWeight: 700, fontSize: '15px' }}>
            красвордс <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>· админ</span>
          </Link>
          <Link href="/admin" style={navLink}>кроссворды</Link>
          <Link href="/admin/new" style={navLink}>+ новый</Link>
          <Link href="/" style={{ ...navLink, marginLeft: 'auto' }}>← на сайт</Link>
          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{user.email}</span>
          <LogoutButton />
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
  color: 'var(--text-secondary)',
  padding: '6px 10px',
  borderRadius: '8px',
}
