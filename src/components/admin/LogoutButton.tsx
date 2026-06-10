'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const onClick = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
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
