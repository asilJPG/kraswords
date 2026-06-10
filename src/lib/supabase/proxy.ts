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

  // Single profile lookup for both username + role
  let profile: { username: string | null; role: string | null } | null = null
  if (user && !isApiRoute) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('profiles') as any)
      .select('username, role')
      .eq('id', user.id)
      .single()
    profile = data ?? null
  }
  const isAdmin = profile?.role === 'admin'

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
  if (user && !isSetupRoute && !isAdminRoute && !isApiRoute && !profile?.username) {
    const url = request.nextUrl.clone()
    url.pathname = '/setup-profile'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}
