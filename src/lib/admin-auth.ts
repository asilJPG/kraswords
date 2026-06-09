export const ADMIN_COOKIE = 'kw_admin'
export const ADMIN_TOKEN = process.env.ADMIN_SESSION_TOKEN ?? 'kw-admin-dev-2025'

export function isAdminCookie(value: string | undefined): boolean {
  return !!value && value === ADMIN_TOKEN
}
