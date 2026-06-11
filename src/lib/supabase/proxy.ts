import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

const PROTECTED_PREFIXES = ['/play', '/profile']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isLoginRoute = pathname === '/login'
  const isSetupRoute = pathname === '/setup-profile'
  const isApiRoute = pathname.startsWith('/api')

  // Fast path: anonymous-friendly routes (/, /top, etc.) skip the auth network call.
  // We only need user identity to gate /admin, /profile, /play, /login, /setup-profile.
  const needsAuthCheck = isAdminRoute || isProtectedRoute || isLoginRoute || isSetupRoute
  if (!needsAuthCheck) {
    return response
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // not logged in → login (except setup-profile which we handle separately)
  if ((isAdminRoute || isProtectedRoute) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isSetupRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const hasProfileCookie = request.cookies.get('has_profile')?.value === 'true'
  const roleCookie = request.cookies.get('user_role')?.value

  // Query username (from profiles) and admin flag (from admin_users) only when needed.
  let usernameFromDb: string | null = null
  let adminFromDb: boolean | null = null

  if (user && !isApiRoute) {
    const needUsername = !hasProfileCookie || isAdminRoute
    const needAdmin = isAdminRoute || !roleCookie

    if (needUsername) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('profiles') as any)
        .select('username')
        .eq('id', user.id)
        .maybeSingle()
      usernameFromDb = data?.username ?? null
    }

    if (needAdmin) {
      // admin_users RLS lets users see only their own row → exact check
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('admin_users') as any)
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      adminFromDb = !!data
    }
  }

  // For admin routes always trust DB; otherwise fall back to cookie cache
  const isAdmin = isAdminRoute
    ? adminFromDb === true
    : (adminFromDb === true || roleCookie === 'admin')

  const hasUsername = hasProfileCookie || !!usernameFromDb

  // logged in but not an admin → can't access /admin/*
  if (isAdminRoute && user && !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? '/admin' : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // logged-in Supabase users without a profile/username must finish setup
  if (user && !isSetupRoute && !isAdminRoute && !isApiRoute && !hasUsername) {
    const url = request.nextUrl.clone()
    url.pathname = '/setup-profile'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Cache username + admin flag in cookies for next request
  if (user && !isApiRoute) {
    if (usernameFromDb && !hasProfileCookie) {
      response.cookies.set('has_profile', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30 })
    }
    if (adminFromDb !== null) {
      const desired = adminFromDb ? 'admin' : 'user'
      if (roleCookie !== desired) {
        response.cookies.set('user_role', desired, { path: '/', maxAge: 60 * 60 * 24 * 30 })
      }
    }
  }

  return response
}
