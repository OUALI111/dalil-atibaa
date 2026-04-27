import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug, wilaya } = await params

  const { data: specialty } = await supabase
    .from('specialties').select('name_fr').eq('slug', slug).single()
  const { data: wilayaData } = await supabase
    .from('wilayas').select('name_fr').eq('slug', wilaya).single()

  if (!specialty || !wilayaData) return { title: 'Page introuvable' }

  return {
    title: `${specialty.name_fr} a ${wilayaData.name_fr} | Dalil Atibaa`,
    description: `Trouvez les meilleurs ${specialty.name_fr} a ${wilayaData.name_fr}. Adresses, telephones et avis patients.`,
    alternates: {
      canonical: `https://www.dalil-atibaa.com/specialites/${slug}/${wilaya}`,
    },
  }
}

export default async function SpecialiteWilayaPage({ params, searchParams }) {
  const { slug, wilaya } = await params
  const sp = await searchParams
  const currentPage = parseInt(sp?.page || '0')
  const pageSize = 24
  const from = currentPage * pageSize
  const to = from + pageSize - 1

  const { data: specialty } = await supabase
    .from('specialties').select('*').eq('slug', slug).single()
  const { data: wilayaData } = await supabase
    .from('wilayas').select('*').eq('slug', wilaya).single()

  if (!specialty || !wilayaData) notFound()

  const { data: doctors, count: totalDoctors } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      specialties(name_fr),
      wilayas(name_fr)
    `, { count: 'exact' })
    .eq('specialty_id', specialty.id)
    .eq('wilaya_id', wilayaData.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((totalDoctors || 0) / pageSize)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${specialty.name_fr} a ${wilayaData.name_fr}`,
    numberOfItems: totalDoctors || 0,
    itemListElement: doctors?.map((d, i) => ({
      '@type': 'ListItem',
      position: from + i + 1,
      name: d.name_fr,
      url: `https://www.dalil-atibaa.com/docteur/${d.slug}`,
    }))
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-500 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <span>›</span>
        <Link href={`/specialites/${slug}`} className="hover:text-blue-600">
          {specialty.name_fr}
        </Link>
        <span>›</span>
        <span className="text-gray-800">{wilayaData.name_fr}</span>
      </div>

      <div className="bg-blue-700 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">
            {specialty.name_fr} a {wilayaData.name_fr}
          </h1>
          <p className="text-blue-100 mt-2">
            {totalDoctors || 0} medecin(s) disponible(s)
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!doctors || doctors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">
              Aucun {specialty.name_fr} trouve a {wilayaData.name_fr}
            </p>
            <Link href={`/specialites/${slug}`}
              className="text-blue-600 hover:underline">
              Voir tous les {specialty.name_fr} en Algerie
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(doctor => (
              <Link key={doctor.id} href={`/docteur/${doctor.slug}`}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                      {doctor.name_fr?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-800 truncate">
                        {doctor.name_fr}
                      </h2>
                      <p className="text-blue-600 text-sm">{specialty.name_fr}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400">&#9733;</span>
                        <span className="text-sm text-gray-500">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  {doctor.address && (
                    <p className="text-gray-400 text-xs mt-2 truncate">
                      &#128205; {doctor.address}
                    </p>
                  )}
                  {doctor.phone && (
                    <p className="text-green-600 text-sm mt-1">
                      &#128222; {doctor.phone}
                    </p>
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
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {currentPage > 0 && (
              <a href={`/specialites/${slug}/${wilaya}?page=${currentPage - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 transition">
                Precedent
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(currentPage - 3, totalPages - 7)) + i
              return (
                <a key={pageNum}
                  href={`/specialites/${slug}/${wilaya}?page=${pageNum}`}
                  className={`px-4 py-2 rounded-xl border transition ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'
                  }`}>
                  {pageNum + 1}
                </a>
              )
            })}
            {currentPage < totalPages - 1 && (
              <a href={`/specialites/${slug}/${wilaya}?page=${currentPage + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 transition">
                Suivant
              </a>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Trouver un {specialty.name_fr} a {wilayaData.name_fr}
          </h2>
          <p className="text-gray-600 mb-4">
            Consultez la liste complete des {specialty.name_fr} a {wilayaData.name_fr}.
            Trouvez facilement un {specialty.name_fr} avec adresse et numero de telephone.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">
                Comment choisir un {specialty.name_fr} a {wilayaData.name_fr} ?
              </p>
              <p className="text-gray-500 text-sm">
                Consultez les notes et avis patients pour chaque {specialty.name_fr} sur Dalil Atibaa.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">
                Comment prendre rendez-vous ?
              </p>
              <p className="text-gray-500 text-sm">
                Cliquez sur la fiche du medecin pour voir son numero et prendre rendez-vous.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {specialty.name_fr} dans d autres wilayas
          </h2>
          <div className="flex flex-wrap gap-2">
            {['alger', 'oran', 'constantine', 'annaba', 'blida', 'batna',
              'setif', 'tizi-ouzou', 'bejaia', 'tlemcen'].map(w =>
              w !== wilaya ? (
                <Link key={w} href={`/specialites/${slug}/${w}`}
                  className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition">
                  {w.charAt(0).toUpperCase() + w.slice(1).replace('-', ' ')}
                </Link>
              ) : null
            )}
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm mt-8">
        2025 Dalil Atibaa - Annuaire des medecins en Algerie
      </footer>

    </main>
  )
}