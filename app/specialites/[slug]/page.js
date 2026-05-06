import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: specialty } = await supabase
    .from('specialties').select('name_fr').eq('slug', slug).single()

  if (!specialty) return { title: 'Spécialité introuvable' }

  return {
    title: `${specialty.name_fr} en Algérie | Dalil Atibaa`,
    description: `Liste des ${specialty.name_fr} en Algérie. Adresses, téléphones et avis patients. Prenez rendez-vous facilement.`,
    alternates: { canonical: `https://www.dalil-atibaa.com/specialites/${slug}` },
  }
}

export default async function SpecialitePage({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams
  const page = parseInt(sp?.page || '0')
  const pageSize = 24

  const { data: specialty } = await supabase
    .from('specialties').select('*').eq('slug', slug).single()

  if (!specialty) notFound()

  // ✅ Wilayas qui ont AU MOINS 1 médecin pour CETTE spécialité
  const { data: activeWilayaIds } = await supabase
    .from('doctors')
    .select('wilaya_id')
    .eq('specialty_id', specialty.id)
    .eq('is_active', true)

  const wilayaIds = [...new Set(activeWilayaIds?.map(d => d.wilaya_id) || [])]

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('name_fr, slug')
    .in('id', wilayaIds)
    .order('name_fr')

    const { data: meilleursPages } = await supabase
  .from('meilleurs_pages')
  .select('wilaya_slug')
  .eq('specialty_slug', slug)
  .eq('is_active', true)
  
  // Médecins paginés
  const from = page * pageSize
  const to = from + pageSize - 1

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

  const totalPages = Math.ceil((totalDoctors || 0) / pageSize)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${specialty.name_fr} en Algérie`,
    numberOfItems: totalDoctors,
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Dalil Atibaa" className="h-9 w-auto" />
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
            <span>Spécialités</span>
            <span>›</span>
            <span className="text-white">{specialty.name_fr}</span>
          </div>
          <h1 className="text-3xl font-bold">{specialty.name_fr} en Algérie</h1>
          <p className="text-blue-100 mt-2">
            {totalDoctors} médecin(s) dans {wilayas?.length} wilaya(s)
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ✅ FILTRES — seulement les wilayas avec des médecins pour cette spécialité */}
        {wilayas && wilayas.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3 font-medium">
              {wilayas.length} wilaya(s) avec des {specialty.name_fr} :
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/specialites/${slug}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Toutes les wilayas
              </Link>
              {wilayas.map(w => (
                <Link key={w.slug}
                  href={`/specialites/${slug}/${w.slug}`}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition">
                  {w.name_fr}
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
                      <p className="text-blue-600 text-xs font-medium">{doctor.wilayas?.name_fr}</p>
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
              <a href={`/specialites/${slug}?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 text-sm transition">
                ← Précédent
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return (
                <a key={p} href={`/specialites/${slug}?page=${p}`}
                  className={`px-4 py-2 rounded-xl border text-sm transition ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'}`}>
                  {p + 1}
                </a>
              )
            })}
            {page < totalPages - 1 && (
              <a href={`/specialites/${slug}?page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 text-sm transition">
                Suivant →
              </a>
            )}
          </div>
        )}
        
     {/* MEILLEURS PAGES */}
{meilleursPages && meilleursPages.length > 0 && (
  <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
    <h2 className="text-lg font-bold text-gray-800 mb-4">
      Meilleurs {specialty.name_fr} par wilaya
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {meilleursPages.map(mp => {
        const wilayaObj = wilayas?.find(w => w.slug === mp.wilaya_slug)
        return (
          <Link key={mp.wilaya_slug} href={`/meilleurs/${slug}-${mp.wilaya_slug}`}
            className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
              {wilayaObj?.name_fr || mp.wilaya_slug}
            </span>
          </Link>
        )
      })}
    </div>
  </div>
)}
        {/* SEO CONTENT */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3">{specialty.name_fr} en Algérie</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Consultez notre annuaire complet des {specialty.name_fr} en Algérie.
            {totalDoctors} médecins référencés dans {wilayas?.length} wilayas.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1 text-sm">Comment choisir un bon {specialty.name_fr} ?</p>
              <p className="text-gray-500 text-xs">Consultez les notes et avis patients pour chaque médecin sur Dalil Atibaa.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1 text-sm">Dans quelles wilayas trouver un {specialty.name_fr} ?</p>
              <p className="text-gray-500 text-xs">{wilayas?.map(w => w.name_fr).join(', ')}.</p>
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