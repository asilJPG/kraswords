import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

interface Avatar { type: string; value: string }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dbHistory: { crossword_id: string; time_seconds: number; played_at: string; solved: boolean }[] = []
  let profile: { username: string; banner_url: string | null; avatar: Avatar | null } | null = null
  const titleById: Record<string, { title: string; emoji: string }> = {}

  if (user) {
    // Two parallel queries:
    // 1) game_results with embedded crossword title+emoji (single round-trip, no separate fetch)
    // 2) profile by id
    const [histRes, profileRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('game_results') as any)
        .select('crossword_id, time_seconds, played_at, solved, crossword:crosswords(title, emoji)')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(100),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('profiles') as any)
        .select('username, banner_url, avatar')
        .eq('id', user.id)
        .single(),
    ])

    const rows = (histRes.data ?? []) as Array<{
      crossword_id: string
      time_seconds: number
      played_at: string
      solved: boolean
      crossword: { title: string; emoji: string } | null
    }>

    dbHistory = rows.map(r => ({
      crossword_id: r.crossword_id,
      time_seconds: r.time_seconds,
      played_at: r.played_at,
      solved: r.solved,
    }))
    for (const r of rows) {
      if (r.crossword) {
        titleById[r.crossword_id] = { title: r.crossword.title, emoji: r.crossword.emoji }
      }
    }
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
      titleById={titleById}
      username={profile?.username ?? null}
      bannerUrl={profile?.banner_url ?? null}
      avatarEmoji={avatarEmoji}
    />
  )
}
