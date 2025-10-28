import { NextResponse } from 'next/server'

// ✅ Basic Auth checker
function checkAuth(request, username, password, realmName) {
  const auth = request.headers.get('authorization')
  const validAuth = 'Basic ' + btoa(`${username}:${password}`)

  if (auth !== validAuth) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': `Basic realm="${realmName}"` },
    })
  }

  return null
}

export function middleware(request) {
  const url = new URL(request.url)
  const { pathname } = url

  // 🎯 Protect and redirect /onetv.m3u
  if (pathname === '/onetv.m3u') {
    const unauthorized = checkAuth(request, 'onetv', 'onetv', 'OneTV Secure Area')
    if (unauthorized) return unauthorized

    return NextResponse.redirect(
      'https://raw.githubusercontent.com/RJMBTS/Aupl/refs/heads/main/onetv.m3u'
    )
  }

  // 🎯 Protect and redirect /Master.m3u
  if (pathname === '/Master.m3u') {
    const unauthorized = checkAuth(request, 'RJM', 'bts', 'Master Secure Area')
    if (unauthorized) return unauthorized

    return NextResponse.redirect(
      'https://raw.githubusercontent.com/RJMBTS/Aupl/refs/heads/main/Master.m3u'
    )
  }

  // Continue for all other paths
  return NextResponse.next()
}

export const config = {
  matcher: ['/onetv.m3u', '/Master.m3u'], // Apply only to these
}
