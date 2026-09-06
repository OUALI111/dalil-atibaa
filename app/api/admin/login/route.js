import { NextResponse } from 'next/server'

/**
 * POST /api/admin/login
 * Vérifie les credentials admin côté serveur (jamais dans le bundle JS client)
 * En cas de succès, pose un cookie httpOnly illisible par JavaScript
 */
export async function POST(request) {
  try {
    const { username, password } = await request.json()

    const expectedUsername = process.env.ADMIN_USERNAME
    const expectedPassword = process.env.ADMIN_PASSWORD
    const sessionToken    = process.env.ADMIN_SESSION_TOKEN

    // Vérification côté serveur uniquement
    if (
      username === expectedUsername &&
      password === expectedPassword &&
      expectedUsername &&
      expectedPassword
    ) {
      const response = NextResponse.json({ ok: true })

      // Cookie httpOnly = JavaScript côté client NE PEUT PAS le lire
      response.cookies.set('admin_session', sessionToken || 'dalil-admin-session', {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   60 * 60 * 24 * 7, // 7 jours
        path:     '/admin',
      })

      return response
    }

    // Délai artificiel pour ralentir les attaques brute-force
    await new Promise(r => setTimeout(r, 500))
    return NextResponse.json(
      { ok: false, error: 'Identifiants incorrects' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
