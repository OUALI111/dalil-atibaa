import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Recherche médecins en Algérie | Dalil Atibaa',
  description: 'Recherchez parmi 1021 médecins en Algérie par spécialité et wilaya.',
}

async function getDoctors({ q, specialite, wilaya }) {
  let query = supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating, reviews_count,
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

async function getFilters() {
  const { data: specialties } = await supabase
    .from('specialties').select('id, name_fr, slug').order('name_fr')
  const { data: wilayas } = await supabase
    .from('wilayas').select('id, name_fr, slug').order('name_fr')
  return { specialties, wilayas }
}

function StarRating({ rating }) {
  const stars = Math.round(rating || 0)
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating || 0}</span>
    </div>
  )
}

export default async function RecherchePage({ searchParams }) {
  const params = await searchParams
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa 🇩🇿
          </Link>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="bg-blue-700 py-6 px-4">
        <form action="/recherche" method="GET"
          className="max-w-4xl mx-auto bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-2">
          <input
            name="q"
            defaultValue={q}
            type="text"
            placeholder="Nom du médecin..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select name="specialite" defaultValue={specialite}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none">
            <option value="">Toutes spécialités</option>
            {specialties?.map(s => (
              <option key={s.id} value={s.slug}>{s.name_fr}</option>
            ))}
          </select>
          <select name="wilaya" defaultValue={wilaya}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none">
            <option value="">Toutes wilayas</option>
            {wilayas?.map(w => (
              <option key={w.id} value={w.slug}>{w.name_fr}</option>
            ))}
          </select>
          <button type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">
            Rechercher
          </button>
        </form>
      </div>

      {/* RESULTS */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
  {specialite && wilaya
    ? `Médecins ${specialite} à ${wilaya}`
    : specialite
    ? `${specialite} en Algérie`
    : wilaya
    ? `Médecins à ${wilaya}`
    : 'Recherche de médecins en Algérie'
  }
</h1>
<p className="text-gray-500 mb-6">
  {doctors.length} médecin(s) trouvé(s)
          {q && <span> pour "<strong>{q}</strong>"</span>}
          {specialite && <span> — {specialite}</span>}
          {wilaya && <span> — {wilaya}</span>}
        </p>

        {doctors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Aucun médecin trouvé</p>
            <Link href="/" className="text-blue-600 mt-4 inline-block">
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(doctor => (
              <Link key={doctor.id} href={`/docteur/${doctor.slug}`}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-5 h-full">

                  {/* AVATAR */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                      {doctor.name_fr?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {doctor.name_fr}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {doctor.specialties?.name_fr}
                      </p>
                    </div>
                  </div>

                  {/* RATING */}
                  <StarRating rating={doctor.rating} />

                  {/* INFO */}
                  <div className="mt-3 space-y-1">
                    {doctor.wilayas && (
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        📍 {doctor.wilayas.name_fr}
                      </p>
                    )}
                    {doctor.address && (
                      <p className="text-gray-400 text-xs truncate">
                        {doctor.address}
                      </p>
                    )}
                    {doctor.phone && (
                      <p className="text-green-600 text-sm font-medium">
                        📞 {doctor.phone}
                      </p>
                    )}
                  </div>

                  {/* BUTTON */}
                  <div className="mt-4">
                    <span className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition">
                      Voir le profil →
                    </span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm mt-8">
        <p>© 2025 Dalil Atibaa — Annuaire des médecins en Algérie</p>
      </footer>

    </main>
  )
}