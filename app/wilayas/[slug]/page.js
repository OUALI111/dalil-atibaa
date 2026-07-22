import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
export const revalidate = 3600

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

    const { data: meilleursPages } = await supabase
  .from('meilleurs_pages')
  .select('specialty_slug')
  .eq('wilaya_slug', slug)
  .eq('is_active', true)
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div style={{ backgroundColor: '#1A87D8' }} className="text-white pt-6 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Logo en haut à gauche */}
          <div className="mb-6">
            <Link href="/" className="inline-block">
              <img 
                src="/logo.svg" 
                alt="Dalil Atibaa" 
                width="200" 
                height="44" 
                style={{ 
                  height: '36px', 
                  width: 'auto', 
                  filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.95))' 
                }} 
              />
            </Link>
          </div>

          <div className="text-blue-200 text-sm mb-2 flex gap-2 flex-wrap">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>›</span>
            <span>Wilayas</span>
            <span>›</span>
            <span className="text-white">{wilaya.name_fr}</span>
          </div>
          <h1 className="text-3xl font-bold">Médecins à {wilaya.name_fr}</h1>
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
                style={{ backgroundColor: '#1A87D8' }}
                className="text-white px-4 py-2 rounded-full text-sm font-medium">
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
                    <div style={{ backgroundColor: '#1A87D8' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {doctor.name_fr?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-800 truncate text-sm">{doctor.name_fr}</h2>
                      <p style={{ color: '#1A87D8' }} className="text-xs font-medium">{doctor.specialties?.name_fr}</p>
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
                  <span style={{ backgroundColor: '#1E293B' }} className="block w-full text-center hover:opacity-90 text-white py-2 rounded-lg text-sm font-medium mt-auto transition">
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
                  style={p === page ? { backgroundColor: '#1A87D8', borderColor: '#1A87D8' } : {}}
                  className={`px-4 py-2 rounded-xl border text-sm transition ${p === page ? 'text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'}`}>
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
{/* MEILLEURS PAGES */}
{meilleursPages && meilleursPages.length > 0 && (
  <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
    <h2 className="text-lg font-bold text-gray-800 mb-4">
      Meilleurs médecins à {wilaya.name_fr} par spécialité
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {meilleursPages.map(mp => {
        const specObj = specialties?.find(s => s.slug === mp.specialty_slug)
        return (
          <Link key={mp.specialty_slug} href={`/meilleurs/${mp.specialty_slug}-${slug}`}
            className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
              {specObj?.name_fr || mp.specialty_slug}
            </span>
          </Link>
        )
      })}
    </div>
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
      <footer style={{ backgroundColor: '#0f172a' }} className="text-gray-400 py-16 border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
            
            {/* Colonne 1: À Propos */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <img 
                  src="/logo.svg" 
                  alt="Dalil Atibaa" 
                  width="180" 
                  height="40" 
                  style={{ 
                    height: '32px', 
                    width: 'auto', 
                    filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.95))' 
                  }} 
                />
              </Link>
              <p className="text-sm text-gray-300 leading-relaxed">
                Le premier annuaire médical en Algérie. Trouvez un professionnel de santé proche de chez vous et facilitez vos démarches de soin au quotidien.
              </p>
            </div>

            {/* Colonne 2: Liens Utiles */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Liens Utiles</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white transition">Accueil</Link></li>
                <li><Link href="/recherche" className="hover:text-white transition">Recherche avancée</Link></li>
                <li><Link href="/conseils" className="hover:text-white transition">Conseils Médicaux</Link></li>
                <li><Link href="/a-propos" className="hover:text-white transition">À propos de nous</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Nous contacter</Link></li>
              </ul>
            </div>

            {/* Colonne 3: Spécialités populaires */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Spécialités Populaires</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/specialites/dentiste" className="hover:text-white transition">Dentiste en Algérie</Link></li>
                <li><Link href="/specialites/gynecologue" className="hover:text-white transition">Gynécologue en Algérie</Link></li>
                <li><Link href="/specialites/cardiologue" className="hover:text-white transition">Cardiologue en Algérie</Link></li>
                <li><Link href="/specialites/pediatre" className="hover:text-white transition">Pédiatre en Algérie</Link></li>
                <li><Link href="/specialites/ophtalmologue" className="hover:text-white transition">Ophtalmologue en Algérie</Link></li>
              </ul>
            </div>

            {/* Colonne 4: B2B Cabinet */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Vous êtes médecin ?</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Rejoignez Dalil Atibaa pour augmenter la visibilité de votre cabinet et simplifier l'accès aux soins de vos patients.
              </p>
              <Link 
                href="/contact" 
                className="inline-block bg-[#1A87D8] hover:bg-[#1571b6] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                Inscrire mon cabinet
              </Link>
            </div>

          </div>

          {/* Sub-footer */}
          <div className="border-t border-slate-800 mt-12 pt-10 flex flex-col items-center gap-6 text-center text-xs text-gray-300">
            <div className="space-y-3">
              <p className="font-medium">© 2026 Dalil Atibaa — Annuaire des médecins en Algérie. Tous droits réservés.</p>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Dalil Atibaa n'est pas un service d'urgence. En cas d'urgence médicale, contactez le 14 ou le 115.
              </p>
            </div>
            <div className="flex justify-center gap-4 text-gray-400 pt-2">
              <Link href="/a-propos" className="hover:text-white transition">Mentions légales</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition">Support</Link>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </>
  )
}