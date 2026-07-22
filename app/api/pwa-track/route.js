import { supabase } from '../../../lib/supabase'

/**
 * POST /api/pwa-track
 * Reçoit les événements PWA et les stocke dans Supabase
 *
 * Body JSON :
 * {
 *   event    : 'banner_shown' | 'install_clicked' | 'install_accepted' | 'install_dismissed' | 'session_standalone'
 *   platform : 'android' | 'ios'
 *   page     : '/docteur/...' (optionnel)
 *   step     : 'chrome_prompt' (optionnel)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { event, platform, page, step } = body

    // Validation minimale
    const VALID_EVENTS = [
      'banner_shown',
      'install_clicked',
      'install_accepted',
      'install_dismissed',
      'session_standalone',
    ]
    if (!event || !VALID_EVENTS.includes(event)) {
      return Response.json({ error: 'Invalid event' }, { status: 400 })
    }

    // Insertion dans Supabase
    const { error } = await supabase
      .from('pwa_stats')
      .insert({
        event,
        platform: platform || null,
        page:     page     || null,
        step:     step     || null,
      })

    if (error) {
      console.error('[PWA Track] Supabase error:', error.message)
      return Response.json({ error: 'DB error' }, { status: 500 })
    }

    return Response.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[PWA Track] Unexpected error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
