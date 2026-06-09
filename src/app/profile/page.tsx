import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dbHistory: { crossword_id: string; time_seconds: number; played_at: string; solved: boolean }[] = []
  let profile: { username: string; banner_url: string | null } | null = null

  if (user) {
    const [histRes, profileRes] = await Promise.all([
      (supabase.from('game_results') as any)
        .select('crossword_id, time_seconds, played_at, solved')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false }),
      (supabase.from('profiles') as any)
        .select('username, banner_url')
        .eq('id', user.id)
        .single(),
    ])
    dbHistory = histRes.data ?? []
    profile = profileRes.data ?? null
  }

  return (
    <ProfileClient
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
      dbHistory={dbHistory}
      username={profile?.username ?? null}
      bannerUrl={profile?.banner_url ?? null}
    />
  )
}
