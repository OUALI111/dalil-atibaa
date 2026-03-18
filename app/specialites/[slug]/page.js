import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: specialty } = await supabase
    .from('specialties').select('name_fr').eq('slug', slug).single()
  if (!specialty) return { title: 'Specialite introuvable' }
  return {
    title: `${specialty.name_fr} en Algerie | Dalil Atibaa`,
    description: `Liste des ${specialty.name_fr} en Algerie. Adresses, telephones et avis patients. Prenez rendez-vous facilement.`,
    alternates: { canonical: `https://dalil-atibaa.vercel.app/specialites/${slug}` },
  }
}

export default async function SpecialitePage({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams
  const currentPage = parseInt(sp?.page ?? '0')
  const pageSize = 24
  const from = currentPage * pageSize
  const to = from + pageSize - 1

  const { data: specialty } = await supabase
    .from('specialties').select('*').eq('slug', slug).single()
  if (!specialty) notFound()

  const { data: doctors, count: totalDoctors } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      wilayas(name_fr, slug)
    `, { count: 'exact' })
    .eq('specialty_id', specialty.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .range(from, to)

  const { data: wilayas } = await supabase
    .from('wilayas').select('name_fr, slug').order('name_fr')

  const total = totalDoctors || 0
  const totalPages = Math.ceil(total / pageSize)

  const buildUrl = (page) => `/specialites/${slug}?page=${page}`

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa DZ
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-500 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <span>›</span>
        <span>Specialites</span>
        <span>›</span>
        <span className="text-gray-800">{specialty.name_fr}</span>
      </div>

      <div className="bg-blue-700 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">{specialty.name_fr} en Algerie</h1>
          <p className="text-blue-100 mt-2">
            {total} medecin(s) reference(s)
            {totalPages > 1 && ` — Page ${currentPage + 1} sur ${totalPages}`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-gray-500 text-sm mb-3">Filtrer par wilaya:</p>
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href={`/specialites/${slug}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
            Toutes wilayas
          </Link>
          {wilayas?.map(w => (
            <Link key={w.slug} href={`/specialites/${slug}/${w.slug}`}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition">
              {w.name_fr}
            </Link>
          ))}
        </div>

        {!doctors || doctors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Aucun medecin trouve</p>
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
                        <h2 className="font-semibold text-gray-800 truncate">{doctor.name_fr}</h2>
                        <p className="text-blue-600 text-sm">{doctor.wilayas?.name_fr}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400">&#9733;</span>
                          <span className="text-sm text-gray-500">{doctor.rating}</span>
                        </div>
                      </div>
                    </div>
                    {doctor.phone && (
                      <p className="text-green-600 text-sm mt-3">&#128222; {doctor.phone}</p>
                    )}
                    <span className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium mt-3 transition">
                      Voir le profil →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {currentPage > 0 && (
                  <a href={buildUrl(currentPage - 1)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 transition">
                    Precedent
                  </a>
                )}
                {Array.from({ length: totalPages }, (_, i) => {
                  if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    return (
                      <a key={i} href={buildUrl(i)}
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
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 transition">
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">{specialty.name_fr} en Algerie</h2>
          <p className="text-gray-600 mb-4">
            Consultez notre annuaire complet des {specialty.name_fr} en Algerie.
            Trouvez facilement un {specialty.name_fr} avec adresse, telephone et avis patients.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">Comment choisir un bon {specialty.name_fr} ?</p>
              <p className="text-gray-500 text-sm">Consultez les avis et la note de chaque medecin sur Dalil Atibaa.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">Comment prendre rendez-vous ?</p>
              <p className="text-gray-500 text-sm">Appelez directement au numero affiche sur la fiche du medecin.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm mt-8">
        2025 Dalil Atibaa - Annuaire des medecins en Algerie
      </footer>
    </main>
  )
}