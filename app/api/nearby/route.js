import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

// ✅ Jamais de cache : les résultats dépendent de la position de l'utilisateur
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  // -- Lecture des paramètres --
  const lat         = parseFloat(searchParams.get('lat'))
  const lng         = parseFloat(searchParams.get('lng'))
  const radius      = parseFloat(searchParams.get('radius') || '10')
  const specialtyId = searchParams.get('specialty_id') ? parseInt(searchParams.get('specialty_id')) : null
  const page        = parseInt(searchParams.get('page') || '0')

  // -- Validation : on rejette immédiatement les valeurs absurdes --
  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Coordonnées manquantes ou invalides' }, { status: 400 })
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Coordonnées hors limites géographiques' }, { status: 400 })
  }
  if (isNaN(radius) || radius < 1 || radius > 100) {
    return NextResponse.json({ error: 'Rayon invalide — doit être entre 1 et 100 km' }, { status: 400 })
  }
  if (isNaN(page) || page < 0 || page > 50) {
    return NextResponse.json({ error: 'Numéro de page invalide' }, { status: 400 })
  }

  // -- Appel de la fonction SQL RPC Haversine créée dans Supabase --
  // ✅ Les coordonnées ne sont pas stockées en base, elles ne font que transiter
  const { data, error } = await supabase.rpc('doctors_nearby', {
    user_lat:        lat,
    user_lng:        lng,
    radius_km:       radius,
    specialty_filter: specialtyId,
    result_limit:    20,
    result_offset:   page * 20,
  })

  if (error) {
    // On ne log PAS lat/lng pour ne pas conserver les positions dans les logs serveur
    console.error('Supabase RPC doctors_nearby error:', error.message)
    return NextResponse.json({ error: 'Erreur lors de la recherche. Veuillez réessayer.' }, { status: 500 })
  }

  return NextResponse.json(
    {
      results: data || [],
      count:   data?.length || 0,
      page,
      radius,
    },
    {
      headers: {
        // ✅ Jamais en cache — position-dépendant
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}
