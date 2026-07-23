// app/api/search-track/route.js
// ── D2 : Tracking des recherches → table search_stats ─────────────────────────
// Accepte POST { query, wilaya_id, specialty_id, results_count, gps_used }
// Fire-and-forget côté client (sendBeacon ou fetch) → jamais bloquant pour l'UX

import { createClient } from '@supabase/supabase-js'
import { NextResponse }  from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
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
