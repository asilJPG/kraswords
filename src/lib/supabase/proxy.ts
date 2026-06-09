import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'
import { ADMIN_COOKIE, ADMIN_TOKEN } from '@/lib/admin-auth'

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

  const adminCookieValue = request.cookies.get(ADMIN_COOKIE)?.value
  const isAdmin = adminCookieValue === ADMIN_TOKEN

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isLoginRoute = pathname === '/login'
  const isSetupRoute = pathname === '/setup-profile'

  if ((isAdminRoute || isProtectedRoute) && !user && !isAdmin) {
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

  if (isLoginRoute && (user || isAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? '/admin' : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Logged-in Supabase users without a profile/username must finish setup
  const isApiRoute = pathname.startsWith('/api')
  if (user && !isSetupRoute && !isAdminRoute && !isApiRoute) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('username')
      .eq('id', user.id)
      .single()

    if (!profile?.username) {
      const url = request.nextUrl.clone()
      url.pathname = '/setup-profile'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}
