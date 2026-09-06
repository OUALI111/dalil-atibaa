import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/check
 * Vérifie si le cookie de session admin est valide
 * Appelé au chargement de la page admin pour restaurer la session
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const session     = cookieStore.get('admin_session')
    const expected    = process.env.ADMIN_SESSION_TOKEN || 'dalil-admin-session'

    if (session?.value === expected) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

/**
 * POST /api/admin/logout
 * Supprime le cookie de session
 */
export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/admin',
  })
  return response
}
