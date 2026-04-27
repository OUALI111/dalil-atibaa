import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: wilaya } = await supabase
    .from('wilayas').select('name_fr').eq('slug', slug).single()

  if (!wilaya) return { title: 'Wilaya introuvable' }

  return {
    title: `Médecins à ${wilaya.name_fr} | Dalil Atibaa`,
    description: `Trouvez un médecin à ${wilaya.name_fr}. Liste complète avec adresses, téléphones et spécialités disponibles.`,
    alternates: { canonical: `https://www.dalil-atibaa.com/wilayas/${slug}` },
  }
}

export default async function WilayaPage({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams
  const page = parseInt(sp?.page || '0')
  const pageSize = 24

  const { data: wilaya } = await supabase
    .from('wilayas').select('*').eq('slug', slug).single()

  if (!wilaya) notFound()

  // ✅ Spécialités qui ont AU MOINS 1 médecin dans CETTE wilaya
  const { data: activeSpecIds } = await supabase
    .from('doctors')
    .select('specialty_id')
    .eq('wilaya_id', wilaya.id)
    .eq('is_active', true)

  const specIds = [...new Set(activeSpecIds?.map(d => d.specialty_id) || [])]

  const { data: specialties } = await supabase
    .from('specialties')
    .select('name_fr, slug')
    .in('id', specIds)
    .order('name_fr')

  // Médecins paginés
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data: doctors, count: totalDoctors } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      specialties(name_fr, slug)
    `, { count: 'exact' })
    .eq('wilaya_id', wilaya.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((totalDoctors || 0) / pageSize)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Médecins à ${wilaya.name_fr}`,
    numberOfItems: totalDoctors,
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HEADER */}
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
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Accueil
          </Link>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-blue-200 text-sm mb-2 flex gap-2 flex-wrap">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>›</span>
            <span>Wilayas</span>
            <span>›</span>
            <span className="text-white">{wilaya.name_fr}</span>
          </div>
          <h1 className="text-3xl font-bold">Médecins à {wilaya.name_fr}</h1>
          <p className="text-blue-100 mt-2">{totalDoctors} médecin(s) référencé(s)</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ✅ FILTRES — seulement les spécialités avec des médecins dans cette wilaya */}
        {specialties && specialties.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3 font-medium">
              {specialties.length} spécialité(s) disponible(s) à {wilaya.name_fr} :
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/wilayas/${slug}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Tous ({totalDoctors})
              </Link>
              {specialties.map(s => (
                <Link key={s.slug}
                  href={`/wilayas/${slug}/${s.slug}`}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition">
                  {s.name_fr}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* LISTE MÉDECINS */}
        {!doctors || doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-400 text-xl">Aucun médecin trouvé</p>
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
                      <h2 className="font-semibold text-gray-800 truncate text-sm">{doctor.name_fr}</h2>
                      <p className="text-blue-600 text-xs font-medium">{doctor.specialties?.name_fr}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-xs text-gray-500">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  {doctor.address && (
                    <p className="text-gray-400 text-xs mb-1 truncate">📍 {doctor.address}</p>
                  )}
                  {doctor.phone && (
                    <p className="text-green-600 text-xs font-medium mb-3">📞 {doctor.phone}</p>
                  )}
                  <span className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium mt-auto transition">
                    Voir le profil →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {page > 0 && (
              <a href={`/wilayas/${slug}?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 text-sm transition">
                ← Précédent
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return (
                <a key={p} href={`/wilayas/${slug}?page=${p}`}
                  className={`px-4 py-2 rounded-xl border text-sm transition ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'}`}>
                  {p + 1}
                </a>
              )
            })}
            {page < totalPages - 1 && (
              <a href={`/wilayas/${slug}?page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 text-sm transition">
                Suivant →
              </a>
            )}
          </div>
        )}

        {/* SEO CONTENT */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Trouver un médecin à {wilaya.name_fr}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Dalil Atibaa vous aide à trouver rapidement un médecin à {wilaya.name_fr}.
            Notre annuaire recense {totalDoctors} médecins dans {specialties?.length} spécialités disponibles à {wilaya.name_fr}.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1 text-sm">Comment prendre rendez-vous à {wilaya.name_fr} ?</p>
              <p className="text-gray-500 text-xs">Trouvez le médecin sur notre annuaire et appelez directement au numéro indiqué.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1 text-sm">Quelles spécialités à {wilaya.name_fr} ?</p>
              <p className="text-gray-500 text-xs">{specialties?.map(s => s.name_fr).join(', ')}.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-8">
        <div className="flex gap-6 justify-center mb-3 flex-wrap">
          <Link href="/" className="hover:text-white transition">Accueil</Link>
          <Link href="/recherche" className="hover:text-white transition">Recherche</Link>
          <Link href="/a-propos" className="hover:text-white transition">À propos</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </div>
        <p>© 2026 Dalil Atibaa — Annuaire des médecins en Algérie</p>
      </footer>
    </main>
  )
}