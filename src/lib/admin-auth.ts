import type { SupabaseClient } from '@supabase/supabase-js'

// Checks profiles.role === 'admin' for the given user id.
// Promote via SQL: `update profiles set role = 'admin' where id = '...';`
export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role === 'admin'
}
