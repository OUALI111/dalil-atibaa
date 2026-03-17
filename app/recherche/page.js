import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const specialite = params?.specialite || ''
  const wilaya = params?.wilaya || ''
  const q = params?.q || ''

  const paramsList = []
  if (specialite) paramsList.push(`specialite=${specialite}`)
  if (wilaya) paramsList.push(`wilaya=${wilaya}`)

  const canonicalUrl = paramsList.length
    ? `https://dalil-atibaa.vercel.app/recherche?${paramsList.join('&')}`
    : 'https://dalil-atibaa.vercel.app/recherche'

  const title = specialite && wilaya
    ? `${specialite} a ${wilaya} | Dalil Atibaa`
    : specialite
    ? `${specialite} en Algerie | Dalil Atibaa`
    : wilaya
    ? `Medecins a ${wilaya} | Dalil Atibaa`
    : 'Recherche medecins en Algerie | Dalil Atibaa'

  const description = specialite && wilaya
    ? `${specialite} a ${wilaya}. Adresses et telephones disponibles sur Dalil Atibaa.`
    : specialite
    ? `Tous les ${specialite} en Algerie. Coordonnees et avis patients sur Dalil Atibaa.`
    : wilaya
    ? `Medecins a ${wilaya}. Filtrez par specialite et prenez rendez-vous facilement.`
    : 'Annuaire medical Algerie. Trouvez un medecin par wilaya et specialite. Plus de 1000 medecins.'

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: q
      ? { index: false, follow: true }
      : { index: true, follow: true },
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
    {
      revalidate: 3600,
      tags: ['doctors', cacheKey],
    }
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
  {
    revalidate: 86400,
    tags: ['filters'],
  }
)

function StarRating({ rating }) {
  const stars = Math.round(rating || 0)
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>
          &#9733;
        </span>
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

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa
          </Link>
        </div>
      </header>

      <div className="bg-blue-700 py-6 px-4">
        <form action="/recherche" method="GET"
          className="max-w-4xl mx-auto bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom du medecin..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200"
          />
          <select name="specialite" defaultValue={specialite}
            className="px-4 py-2 rounded-xl border border-gray-200">
            <option value="">Toutes specialites</option>
            {specialties?.map(s => (
              <option key={s.id} value={s.slug}>{s.name_fr}</option>
            ))}
          </select>
          <select name="wilaya" defaultValue={wilaya}
            className="px-4 py-2 rounded-xl border border-gray-200">
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

      <div className="max-w-6xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {specialite && wilaya
            ? `Medecins ${specialite} a ${wilaya}`
            : specialite
            ? `${specialite} en Algerie`
            : wilaya
            ? `Medecins a ${wilaya}`
            : 'Recherche de medecins en Algerie'}
        </h1>

        <p className="text-gray-500 mb-6">{total} medecin(s) trouve(s)</p>

        {doctors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Aucun medecin trouve</p>
            <Link href="/" className="text-blue-600 mt-4 inline-block">
              Retour accueil
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(d => (
              <Link key={d.id} href={`/docteur/${d.slug}`}>
                <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                      {d.name_fr?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-800 truncate">{d.name_fr}</h2>
                      <p className="text-blue-600 text-sm">{d.specialties?.name_fr}</p>
                    </div>
                  </div>
                  <StarRating rating={d.rating} />
                  <p className="text-gray-500 text-sm mt-2">&#128205; {d.wilayas?.name_fr}</p>
                  {d.phone && (
                    <p className="text-green-600 text-sm mt-1">&#128222; {d.phone}</p>
                  )}
                  <span className="block w-full text-center bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium mt-3">
                    Voir le profil
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 mb-4 flex-wrap">
            {page > 0 && (
              <a
                href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
                Precedent
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return (
                <a
                  key={pageNum}
                  href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${pageNum}`}
                  className={`px-4 py-2 rounded-xl border transition ${
                    pageNum === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'
                  }`}>
                  {pageNum + 1}
                </a>
              )
            })}
            {page < totalPages - 1 && (
              <a
                href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
                Suivant
              </a>
            )}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {specialite && wilaya
              ? `Trouver un ${specialite} a ${wilaya}`
              : specialite
              ? `Trouver un ${specialite} en Algerie`
              : wilaya
              ? `Medecins a ${wilaya}`
              : 'Trouver un medecin en Algerie'}
          </h2>
          <p className="text-gray-600 mb-4">
            {specialite && wilaya
              ? `Consultez la liste complete des ${specialite} a ${wilaya}. Adresses et telephones disponibles sur Dalil Atibaa.`
              : specialite
              ? `Trouvez les meilleurs ${specialite} en Algerie. Notre annuaire recense tous les ${specialite} avec leurs coordonnees.`
              : wilaya
              ? `Decouvrez tous les medecins a ${wilaya}. Filtrez par specialite pour trouver rapidement le medecin qu il vous faut.`
              : `Dalil Atibaa recense plus de 1000 medecins dans les 58 wilayas d Algerie.`}
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Questions frequentes</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">Comment trouver un medecin ?</p>
              <p className="text-gray-500 text-sm">Utilisez les filtres wilaya et specialite. Les resultats sont tries par note.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">Comment prendre rendez-vous ?</p>
              <p className="text-gray-500 text-sm">Cliquez sur la fiche du medecin pour voir son numero de telephone.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">Les informations sont-elles a jour ?</p>
              <p className="text-gray-500 text-sm">Nous mettons regulierement a jour notre base de donnees.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">Puis-je ajouter mon cabinet ?</p>
              <p className="text-gray-500 text-sm">Oui, contactez-nous pour referencer votre cabinet sur Dalil Atibaa.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        2025 Dalil Atibaa - Annuaire des medecins en Algerie
      </footer>

    </main>
  )
}