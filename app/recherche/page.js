import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const q = params?.q || ''
  const specialite = params?.specialite || ''
  const wilaya = params?.wilaya || ''

  const canonicalUrl = specialite || wilaya
    ? `https://www.dalil-atibaa.com/recherche?${specialite ? `specialite=${specialite}` : ''}${specialite && wilaya ? '&' : ''}${wilaya ? `wilaya=${wilaya}` : ''}`
    : 'https://www.dalil-atibaa.com/recherche'

  const title = specialite && wilaya
    ? `${specialite} à ${wilaya} | Dalil Atibaa`
    : specialite
    ? `${specialite} en Algérie | Dalil Atibaa`
    : wilaya
    ? `Médecins à ${wilaya} | Dalil Atibaa`
    : 'Recherche médecins en Algérie | Dalil Atibaa'

  const description = specialite && wilaya
    ? `Trouvez les meilleurs ${specialite} à ${wilaya}. Adresses, téléphones et avis patients.`
    : specialite
    ? `Liste complète des ${specialite} en Algérie. Adresses et téléphones.`
    : wilaya
    ? `Tous les médecins à ${wilaya}. Filtrez par spécialité.`
    : 'Recherchez parmi 1021 médecins en Algérie par spécialité et wilaya.'

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
  }
}

async function getDoctorsWithCache({ q, specialite, wilaya, page = 0 }) {
  const cacheKey = `search-${q}-${specialite}-${wilaya}-${page}`

  const cachedFn = unstable_cache(
    async () => {
      const pageSize = 24
      const from = page * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('doctors')
        .select(`
          id, name_fr, slug, address, phone, rating,
          specialties(name_fr, slug),
          wilayas(name_fr, slug)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .range(from, to)

      if (q) {
        query = query.textSearch('search_vector', q, {
          type: 'websearch',
          config: 'french'
        })
      }

      if (specialite) {
        const { data: spec } = await supabase
          .from('specialties').select('id').eq('slug', specialite).single()
        if (spec) query = query.eq('specialty_id', spec.id)
      }

      if (wilaya) {
        const { data: wil } = await supabase
          .from('wilayas').select('id').eq('slug', wilaya).single()
        if (wil) query = query.eq('wilaya_id', wil.id)
      }

      const { data, count } = await query
      return { doctors: data || [], total: count || 0, pageSize }
    },
    [cacheKey],
    { revalidate: 3600, tags: ['doctors', cacheKey] }
  )

  return cachedFn()
}

const getFilters = unstable_cache(
  async () => {
    const { data: specialties } = await supabase
      .from('specialties').select('id, name_fr, slug').order('name_fr')
    const { data: wilayas } = await supabase
      .from('wilayas').select('id, name_fr, slug').order('name_fr')
    return { specialties, wilayas }
  },
  ['filters'],
  { revalidate: 86400, tags: ['filters'] }
)

function StarRating({ rating }) {
  const stars = Math.round(rating || 0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-200'}>★</span>
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
  const page = parseInt(params?.page || '0')

  const [{ doctors, total, pageSize }, { specialties, wilayas }] = await Promise.all([
    getDoctorsWithCache({ q, specialite, wilaya, page }),
    getFilters()
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ═══ HEADER ═══ */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Dalil Atibaa</span>
          </Link>
          <Link href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Accueil
          </Link>
        </div>
      </header>

      {/* ═══ BARRE DE RECHERCHE MOBILE RESPONSIVE ═══ */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 py-5 px-4">
        <form action="/recherche" method="GET"
          className="max-w-4xl mx-auto bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-3 shadow-xl">

          {/* Input nom */}
          <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Nom du médecin..."
              className="w-full text-gray-800 placeholder-gray-400 focus:outline-none text-sm bg-transparent"
            />
          </div>

          {/* Select spécialité */}
          <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            <select name="specialite" defaultValue={specialite}
              className="w-full text-gray-700 focus:outline-none text-sm bg-transparent appearance-none cursor-pointer">
              <option value="">Spécialité</option>
              {specialties?.map(s => (
                <option key={s.id} value={s.slug}>{s.name_fr}</option>
              ))}
            </select>
          </div>

          {/* Select wilaya */}
          <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <select name="wilaya" defaultValue={wilaya}
              className="w-full text-gray-700 focus:outline-none text-sm bg-transparent appearance-none cursor-pointer">
              <option value="">Wilaya</option>
              {wilayas?.map(w => (
                <option key={w.id} value={w.slug}>{w.name_fr}</option>
              ))}
            </select>
          </div>

          {/* Bouton */}
          <button type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition w-full md:w-auto whitespace-nowrap">
            Rechercher
          </button>
        </form>
      </div>

      {/* ═══ RÉSULTATS ═══ */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {specialite && wilaya
            ? `${specialite} à ${wilaya}`
            : specialite
            ? `${specialite} en Algérie`
            : wilaya
            ? `Médecins à ${wilaya}`
            : 'Recherche de médecins en Algérie'}
        </h1>
        <p className="text-gray-500 mb-6">
          {total} médecin(s) trouvé(s)
          {total > pageSize && ` — ${page * pageSize + 1}-${Math.min((page + 1) * pageSize, total)} affichés`}
        </p>

        {doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 text-xl mb-2">Aucun médecin trouvé</p>
            <p className="text-gray-400 text-sm mb-6">Essayez avec d&apos;autres critères de recherche</p>
            <Link href="/recherche"
              className="text-blue-600 hover:underline font-medium">
              Réinitialiser la recherche
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(doctor => (
              <Link key={doctor.id} href={`/docteur/${doctor.slug}`}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-5 h-full flex flex-col">

                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {doctor.name_fr?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-800 truncate text-sm">
                        {doctor.name_fr}
                      </h2>
                      <p className="text-blue-600 text-xs font-medium">
                        {doctor.specialties?.name_fr}
                      </p>
                    </div>
                  </div>

                  <StarRating rating={doctor.rating} />

                  <div className="mt-3 space-y-1.5 flex-1">
                    {doctor.wilayas && (
                      <p className="text-gray-500 text-xs flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {doctor.wilayas.name_fr}
                        {doctor.address && ` — ${doctor.address.substring(0, 30)}...`}
                      </p>
                    )}
                    {doctor.phone && (
                      <p className="text-green-600 text-xs font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {doctor.phone}
                      </p>
                    )}
                  </div>

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

        {/* ═══ PAGINATION ═══ */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {page > 0 && (
              <a href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition text-sm">
                ← Précédent
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return (
                <a key={pageNum}
                  href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${pageNum}`}
                  className={`px-4 py-2 rounded-xl border transition text-sm ${
                    pageNum === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'
                  }`}>
                  {pageNum + 1}
                </a>
              )
            })}
            {page < totalPages - 1 && (
              <a href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition text-sm">
                Suivant →
              </a>
            )}
          </div>
        )}

        {/* ═══ SEO CONTENT ═══ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {specialite && wilaya ? `Trouver un ${specialite} à ${wilaya}`
              : specialite ? `Trouver un ${specialite} en Algérie`
              : wilaya ? `Médecins à ${wilaya}`
              : 'Trouver un médecin en Algérie'}
          </h2>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {specialite && wilaya
              ? `Consultez la liste complète des ${specialite} à ${wilaya}. Adresses, numéros de téléphone et avis patients disponibles sur Dalil Atibaa.`
              : specialite
              ? `Trouvez les meilleurs ${specialite} en Algérie. Notre annuaire recense tous les ${specialite} avec leurs coordonnées complètes.`
              : wilaya
              ? `Découvrez tous les médecins disponibles à ${wilaya}. Filtrez par spécialité pour trouver rapidement le médecin qu&apos;il vous faut.`
              : `Dalil Atibaa recense plus de 1000 médecins dans les 58 wilayas d&apos;Algérie. Recherchez par spécialité, wilaya ou nom du médecin.`}
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { q: 'Comment trouver un médecin rapidement ?', a: 'Utilisez les filtres de recherche pour sélectionner votre wilaya et spécialité. Les résultats sont triés par note.' },
              { q: 'Comment prendre rendez-vous ?', a: 'Cliquez sur la fiche du médecin pour voir son numéro de téléphone et prendre rendez-vous directement.' },
              { q: 'Les informations sont-elles à jour ?', a: 'Nous mettons régulièrement à jour notre base de données pour garantir des informations fiables.' },
              { q: 'Puis-je ajouter mon cabinet ?', a: 'Oui, contactez-nous pour référencer votre cabinet médical sur Dalil Atibaa.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-1 text-sm">{item.q}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-8">
        <div className="flex gap-6 justify-center mb-3 flex-wrap">
          <Link href="/" className="hover:text-white transition">Accueil</Link>
          <Link href="/recherche" className="hover:text-white transition">Recherche</Link>
          <Link href="/a-propos" className="hover:text-white transition">À propos</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </div>
        <p>© 2025 Dalil Atibaa — Annuaire des médecins en Algérie</p>
      </footer>

    </main>
  )
}