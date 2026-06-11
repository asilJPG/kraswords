import type { SupabaseClient } from '@supabase/supabase-js'

// Checks if userId is in public.admin_users.
// Promote via SQL:
//   insert into public.admin_users (user_id)
//   select id from public.profiles where username = '<твой_ник>';
export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('admin_users') as any)
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
