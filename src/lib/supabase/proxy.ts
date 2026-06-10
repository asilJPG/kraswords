import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

const PROTECTED_PREFIXES = ['/play', '/profile']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

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

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isLoginRoute = pathname === '/login'
  const isSetupRoute = pathname === '/setup-profile'
  const isApiRoute = pathname.startsWith('/api')

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

  // Single profile lookup for both username + role
  let profile: { username: string | null; role: string | null } | null = null
  let needDbCheck = false

  // We only query DB if:
  // 1. We are accessing admin route (to double check role securely)
  // 2. Or user is logged in, but doesn't have the has_profile cookie or role cookie yet
  if (user && !isApiRoute) {
    if (isAdminRoute || !hasProfileCookie || !roleCookie) {
      needDbCheck = true
    }
  }

  if (needDbCheck && user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('profiles') as any)
      .select('username, role')
      .eq('id', user.id)
      .single()
    profile = data ?? null
  }

  const isAdmin = isAdminRoute
    ? profile?.role === 'admin'
    : (roleCookie === 'admin' || profile?.role === 'admin')

  const hasUsername = hasProfileCookie || !!profile?.username

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

  // Set cookies to cache role and profile status in response
  if (user && profile && !isApiRoute) {
    if (profile.username && !hasProfileCookie) {
      response.cookies.set('has_profile', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30 })
    }
    if (profile.role && roleCookie !== profile.role) {
      response.cookies.set('user_role', profile.role, { path: '/', maxAge: 60 * 60 * 24 * 30 })
    }
  }

  return response
}
