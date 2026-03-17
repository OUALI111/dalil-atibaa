import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export async function generateMetadata({ searchParams }) {
  const params = searchParams

  const q = params?.q || ''
  const specialite = params?.specialite || ''
  const wilaya = params?.wilaya || ''

  // ✅ Canonical propre
  const paramsList = []
  if (specialite) paramsList.push(`specialite=${specialite}`)
  if (wilaya) paramsList.push(`wilaya=${wilaya}`)

  const canonicalUrl = paramsList.length
    ? `https://dalil-atibaa.vercel.app/recherche?${paramsList.join('&')}`
    : 'https://dalil-atibaa.vercel.app/recherche'

  // ✅ SEO title
  const title = specialite && wilaya
    ? `${specialite} à ${wilaya} | Dalil Atibaa`
    : specialite
    ? `${specialite} en Algérie | Dalil Atibaa`
    : wilaya
    ? `Médecins à ${wilaya} | Dalil Atibaa`
    : 'Recherche médecins en Algérie | Dalil Atibaa'

  // ✅ SEO description
  const description = specialite && wilaya
    ? `Trouvez les meilleurs ${specialite} à ${wilaya}. Adresses et téléphones.`
    : specialite
    ? `Liste complète des ${specialite} en Algérie.`
    : wilaya
    ? `Tous les médecins à ${wilaya}.`
    : 'Recherchez parmi des médecins en Algérie par spécialité et wilaya.'

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: q
      ? { index: false, follow: true } // ❗ évite spam SEO
      : { index: true, follow: true },
  }
}

// ✅ FETCH DOCTORS
async function getDoctors({ q, specialite, wilaya }) {
  let query = supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      specialties(name_fr, slug),
      wilayas(name_fr, slug)
    `)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(24)

  if (q) {
    query = query.ilike('name_fr', `%${q}%`)
  }

  if (specialite) {
    const { data: spec } = await supabase
      .from('specialties')
      .select('id')
      .eq('slug', specialite)
      .single()

    if (spec) query = query.eq('specialty_id', spec.id)
  }

  if (wilaya) {
    const { data: wil } = await supabase
      .from('wilayas')
      .select('id')
      .eq('slug', wilaya)
      .single()

    if (wil) query = query.eq('wilaya_id', wil.id)
  }

  const { data } = await query
  return data || []
}

// ✅ FILTERS
async function getFilters() {
  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name_fr, slug')
    .order('name_fr')

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('id, name_fr, slug')
    .order('name_fr')

  return { specialties, wilayas }
}

// ⭐ STARS
function StarRating({ rating }) {
  const stars = Math.round(rating || 0)

  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
      <span className="text-sm text-gray-500 ml-1">
        {rating || 0}
      </span>
    </div>
  )
}

// ✅ PAGE
export default async function RecherchePage({ searchParams }) {
  const params = searchParams

  const q = params?.q || ''
  const specialite = params?.specialite || ''
  const wilaya = params?.wilaya || ''

  const [doctors, { specialties, wilayas }] = await Promise.all([
    getDoctors({ q, specialite, wilaya }),
    getFilters()
  ])

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa 🇩🇿
          </Link>
        </div>
      </header>

      {/* SEARCH */}
      <div className="bg-blue-700 py-6 px-4">
        <form
          action="/recherche"
          method="GET"
          className="max-w-4xl mx-auto bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-2"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom du médecin..."
            className="flex-1 px-4 py-2 rounded-xl border"
          />

          <select name="specialite" defaultValue={specialite} className="px-4 py-2 rounded-xl border">
            <option value="">Toutes spécialités</option>
            {specialties?.map(s => (
              <option key={s.id} value={s.slug}>{s.name_fr}</option>
            ))}
          </select>

          <select name="wilaya" defaultValue={wilaya} className="px-4 py-2 rounded-xl border">
            <option value="">Toutes wilayas</option>
            {wilayas?.map(w => (
              <option key={w.id} value={w.slug}>{w.name_fr}</option>
            ))}
          </select>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl">
            Rechercher
          </button>
        </form>
      </div>

      {/* RESULTS */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold mb-2">
          {specialite && wilaya
            ? `Médecins ${specialite} à ${wilaya}`
            : specialite
            ? `${specialite} en Algérie`
            : wilaya
            ? `Médecins à ${wilaya}`
            : 'Recherche de médecins en Algérie'}
        </h1>

        <p className="text-gray-500 mb-6">
          {doctors.length} résultat(s)
        </p>

        {doctors.length === 0 ? (
          <p className="text-gray-400">Aucun médecin trouvé</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(d => (
              <Link key={d.id} href={`/docteur/${d.slug}`}>
                <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">

                  <h3 className="font-semibold">{d.name_fr}</h3>
                  <p className="text-blue-600 text-sm">{d.specialties?.name_fr}</p>

                  <StarRating rating={d.rating} />

                  <p className="text-gray-500 text-sm mt-2">
                    📍 {d.wilayas?.name_fr}
                  </p>

                  {d.phone && (
                    <p className="text-green-600 text-sm">
                      📞 {d.phone}
                    </p>
                  )}

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        © 2025 Dalil Atibaa
      </footer>

    </main>
  )
}