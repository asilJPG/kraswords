import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

interface Avatar { type: string; value: string }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dbHistory: { crossword_id: string; time_seconds: number; played_at: string; solved: boolean }[] = []
  let profile: { username: string; banner_url: string | null; avatar: Avatar | null } | null = null

  if (user) {
    const [histRes, profileRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('game_results') as any)
        .select('crossword_id, time_seconds, played_at, solved')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('profiles') as any)
        .select('username, banner_url, avatar')
        .eq('id', user.id)
        .single(),
    ])
    dbHistory = histRes.data ?? []
    profile = profileRes.data ?? null
  }

  const avatarEmoji =
    profile?.avatar?.type === 'emoji' && profile.avatar.value
      ? profile.avatar.value
      : '😎'

  return (
    <ProfileClient
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
      dbHistory={dbHistory}
      username={profile?.username ?? null}
      bannerUrl={profile?.banner_url ?? null}
      avatarEmoji={avatarEmoji}
    />
  )
}
