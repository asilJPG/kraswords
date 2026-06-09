'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_COOKIE } from '@/lib/admin-auth'

export default function LogoutButton({ isAdminCookie }: { isAdminCookie: boolean }) {
  const router = useRouter()

  const onClick = async () => {
    if (isAdminCookie) {
      document.cookie = `${ADMIN_COOKIE}=; path=/; max-age=0`
    } else {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={onClick} style={{
      padding: '6px 10px',
      background: '#f3f4f6',
      border: 'none',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#6b7280',
      cursor: 'pointer',
      fontFamily: 'inherit',
    }}>
      выйти
    </button>
  )
}
