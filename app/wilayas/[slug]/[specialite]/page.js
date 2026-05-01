import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug, specialite } = await params

  const { data: wilayaData } = await supabase
    .from('wilayas').select('name_fr').eq('slug', slug).single()
  const { data: specialty } = await supabase
    .from('specialties').select('name_fr').eq('slug', specialite).single()

  if (!wilayaData || !specialty) return { title: 'Page introuvable' }

  return {
    title: `${specialty.name_fr} a ${wilayaData.name_fr} | Dalil Atibaa`,
    description: `Trouvez les meilleurs ${specialty.name_fr} a ${wilayaData.name_fr}. Adresses, telephones et avis patients.`,
    alternates: {
      canonical: `https://www.dalil-atibaa.com/wilayas/${slug}/${specialite}`,
    },
  }
}

export default async function WilayaSpecialitePage({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  
  const slug = resolvedParams.slug
  const specialite = resolvedParams.specialite
  const currentPage = parseInt(resolvedSearch?.page ?? '0')
  const pageSize = 24
  const from = currentPage * pageSize
  const to = from + pageSize - 1

  const [{ data: wilayaData }, { data: specialty }] = await Promise.all([
    supabase.from('wilayas').select('*').eq('slug', slug).single(),
    supabase.from('specialties').select('*').eq('slug', specialite).single()
  ])

  if (!wilayaData || !specialty) notFound()

  const { data: doctors, count: totalDoctors } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      specialties(name_fr),
      wilayas(name_fr)
    `, { count: 'exact' })
    .eq('wilaya_id', wilayaData.id)
    .eq('specialty_id', specialty.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .range(from, to)

  const total = totalDoctors || 0
  const totalPages = Math.ceil(total / pageSize)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${specialty.name_fr} a ${wilayaData.name_fr}`,
    numberOfItems: total,
    itemListElement: doctors?.map((d, i) => ({
      '@type': 'ListItem',
      position: from + i + 1,
      name: d.name_fr,
      url: `https://www.dalil-atibaa.com/docteur/${d.slug}`,
    }))
  }

  const buildUrl = (page) => 
    `/wilayas/${slug}/${specialite}?page=${page}`

  return (
    <main className="min-h-screen bg-gray-50">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/">
  <img src="/logo.svg" alt="Dalil Atibaa" style={{height:'36px', width:'auto'}} />
</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-500 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <span>›</span>
        <Link href={`/wilayas/${slug}`} className="hover:text-blue-600">
          {wilayaData.name_fr}
        </Link>
        <span>›</span>
        <span className="text-gray-800">{specialty.name_fr}</span>
      </div>

      <div className="bg-blue-700 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">
            {specialty.name_fr} a {wilayaData.name_fr}
          </h1>
          <p className="text-blue-100 mt-2">
            {total} medecin(s) disponible(s)
            {totalPages > 1 && ` — Page ${currentPage + 1} sur ${totalPages}`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {!doctors || doctors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">
              Aucun {specialty.name_fr} trouve a {wilayaData.name_fr}
            </p>
            <Link href={`/wilayas/${slug}`} className="text-blue-600 hover:underline">
              Voir tous les medecins a {wilayaData.name_fr}
            </Link>
          </div>
        ) : (
          <>
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

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {currentPage > 0 && (
                  <a href={buildUrl(currentPage - 1)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
                    Precedent
                  </a>
                )}

                {Array.from({ length: totalPages }, (_, i) => {
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= currentPage - 2 && i <= currentPage + 2)
                  ) {
                    return (
                      <a key={i}
                        href={buildUrl(i)}
                        className={`px-4 py-2 rounded-xl border transition ${
                          i === currentPage
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'
                        }`}>
                        {i + 1}
                      </a>
                    )
                  }
                  if (i === currentPage - 3 || i === currentPage + 3) {
                    return <span key={i} className="text-gray-400">...</span>
                  }
                  return null
                })}

                {currentPage < totalPages - 1 && (
                  <a href={buildUrl(currentPage + 1)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
                    Suivant
                  </a>
                )}
              </div>
            )}

            <p className="text-center text-gray-400 text-sm mt-3">
              {from + 1}-{Math.min(to + 1, total)} sur {total} medecins
            </p>
          </>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {specialty.name_fr} a {wilayaData.name_fr}
          </h2>
          <p className="text-gray-600 mb-4">
            Consultez la liste complete des {specialty.name_fr} a {wilayaData.name_fr}.
            Trouvez facilement un {specialty.name_fr} avec adresse et numero de telephone.
            Prenez rendez-vous rapidement sur Dalil Atibaa.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">
                Comment choisir un {specialty.name_fr} a {wilayaData.name_fr} ?
              </p>
              <p className="text-gray-500 text-sm">
                Consultez les notes et avis patients pour chaque medecin sur Dalil Atibaa.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">
                Comment prendre rendez-vous ?
              </p>
              <p className="text-gray-500 text-sm">
                Cliquez sur la fiche du medecin pour voir son numero de telephone.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Autres specialites a {wilayaData.name_fr}
          </h2>
          <div className="flex flex-wrap gap-2">
            {['dentiste','ophtalmologue','pediatre','cardiologue',
              'gynecologue','generaliste','dermatologue','neurologue',
              'orl','pneumologue'].map(s =>
              s !== specialite ? (
                <Link key={s} href={`/wilayas/${slug}/${s}`}
                  className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition capitalize">
                  {s}
                </Link>
              ) : null
            )}
          </div>
        </div>

      </div>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm mt-8">
        2026 Dalil Atibaa - Annuaire des medecins en Algerie
      </footer>

    </main>
  )
}