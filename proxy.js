import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// OPTIMISATION CPU : Court-circuit avant toute requête Supabase.
//
// Comment ça marche (explication simple) :
//   - Les ANCIENS slugs (ceux qui ont changé) se terminent TOUJOURS par -CHIFFRES
//     Exemples : "dr-mouiadi-4867", "bouchoukh-4869", "--3445"
//   - Les NOUVEAUX slugs (ceux qui sont valides aujourd'hui) n'ont PAS ce pattern
//     Exemples : "dr-mouiadi-boualem-ophtalmologue-alger-2024"
//
// Si le slug ne termine PAS par -CHIFFRES → c'est un slug valide → on passe
// directement à la page sans AUCUNE requête SQL. Ça couvre 99% des visites.
//
// Si le slug termine par -CHIFFRES → c'est peut-être un ancien slug → on cherche
// une redirection dans Supabase. (moins de 1% des visites)
// ─────────────────────────────────────────────────────────────────────────────
const OLD_SLUG_PATTERN = /-\d+$/

export async function proxy(request) {
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/docteur/')) {
    return NextResponse.next()
  }

  const oldSlug = pathname.replace('/docteur/', '')

  // ✅ COURT-CIRCUIT : slug valide (nouveau format) → 0 requête SQL, 0 CPU
  if (!OLD_SLUG_PATTERN.test(oldSlug)) {
    return NextResponse.next()
  }

  // À partir d'ici : slug suspect (ancien format -NOMBRE) → vérifier la redirection
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: redirect } = await supabase
    .from('slug_redirects')
    .select('new_slug, specialty_slug, wilaya_slug')
    .eq('old_slug', oldSlug)
    .single()

  if (!redirect) return NextResponse.next()

  if (redirect.new_slug) {
    return NextResponse.redirect(
      new URL(`/docteur/${redirect.new_slug}`, request.url),
      { status: 301 }
    )
  }

  if (redirect.specialty_slug && redirect.wilaya_slug) {
    return NextResponse.redirect(
      new URL(`/specialites/${redirect.specialty_slug}/${redirect.wilaya_slug}`, request.url),
      { status: 301 }
    )
  }

  if (redirect.specialty_slug) {
    return NextResponse.redirect(
      new URL(`/specialites/${redirect.specialty_slug}`, request.url),
      { status: 301 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/docteur/:path*',
}