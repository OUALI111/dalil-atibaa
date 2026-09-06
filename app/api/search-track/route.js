// app/api/search-track/route.js
// ── D2 : Tracking des recherches → table search_stats ─────────────────────────
// Accepte POST { query, wilaya_id, specialty_id, results_count, gps_used }
// Fire-and-forget côté client (sendBeacon ou fetch) → jamais bloquant pour l'UX

// ✅ CORRECTION 3 : import du singleton au lieu de createClient() dupliqué
// createClient() à chaque invocation Serverless = nouvelle connexion TCP vers Supabase
// Le singleton réutilise la connexion existante → économise le pool (60 max sur Micro)
import { supabase }              from '../../../lib/supabase'
import { NextResponse }          from 'next/server'
import { rateLimit, getClientIp } from '../../../lib/rateLimit'

export async function POST(request) {
  // ✅ Rate limiting : max 30 requêtes par IP par minute
  // Une recherche par seconde est déjà très rapide pour un humain
  const ip = getClientIp(request)
  const { limited, retryAfter } = rateLimit({
    ip,
    route:    'search-track',
    limit:    30,
    windowMs: 60 * 1000, // 1 minute
  })
  if (limited) {
    // Fire-and-forget → on retourne ok:false sans bloquer l'UX
    return NextResponse.json({ ok: false, reason: 'rate_limited' })
  }

  try {
    const body = await request.json()
    const { query, wilaya_id, specialty_id, results_count, gps_used } = body

    // Ignorer les recherches complètement vides
    if (!query && !wilaya_id && !specialty_id) {
      return NextResponse.json({ ok: false, reason: 'empty' })
    }

    const { error } = await supabase.from('search_stats').insert({
      query:         query         || null,
      wilaya_id:     wilaya_id     || null,
      specialty_id:  specialty_id  || null,
      results_count: results_count ?? 0,
      gps_used:      !!gps_used,
    })

    if (error) {
      // Log server-side sans exposer l'erreur au client
      console.warn('[search-track]', error.message)
      return NextResponse.json({ ok: false })
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Ne jamais bloquer l'UX pour un problème de tracking
    return NextResponse.json({ ok: false })
  }
}
