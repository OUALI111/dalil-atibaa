import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ConseilGpsButton from '../../conseils/[slug]/ConseilGpsButton'

export const revalidate = 3600

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
    .select('wilaya_slug, wilaya_name')
    .eq('specialty_slug', slug)
    .eq('is_active', true)
    .order('wilaya_name')

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gray-50">

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
            <span>Spécialités</span>
            <span>›</span>
            <span className="text-white">{specialty.name_fr}</span>
          </div>
          <h1 className="text-3xl font-bold">{specialty.name_fr} en Algérie</h1>
          <div className="mt-5 flex justify-center sm:justify-start">
            <ConseilGpsButton specialtySlug={slug}>
              Trouver un {specialty.name_fr} près de moi
            </ConseilGpsButton>
          </div>
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
                style={{ backgroundColor: '#1A87D8' }}
                className="text-white px-4 py-2 rounded-full text-sm font-medium">
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
                    <div style={{ backgroundColor: '#1A87D8' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
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
              <a href={`/specialites/${slug}?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 text-sm transition">
                ← Précédent
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return (
                <a key={p} href={`/specialites/${slug}?page=${p}`}
                  style={p === page ? { backgroundColor: '#1A87D8', borderColor: '#1A87D8' } : {}}
                  className={`px-4 py-2 rounded-xl border text-sm transition ${p === page ? 'text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'}`}>
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
        
        {/* ── MEILLEURS PAR WILAYA ─ après les filtres, avant la liste ──────── */}
        {meilleursPages && meilleursPages.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-0.5">Sélection</p>
                <h2 className="font-bold text-gray-800">Meilleurs {specialty.name_fr} par ville</h2>
              </div>
              <span className="text-xs text-blue-500 bg-white border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                {meilleursPages.length} ville{meilleursPages.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {meilleursPages.map(mp => (
                <Link
                  key={mp.wilaya_slug}
                  href={`/meilleurs/${slug}-${mp.wilaya_slug}`}
                  className="flex items-center justify-between gap-2 bg-white hover:bg-blue-600 text-gray-700 hover:text-white border border-blue-100 hover:border-blue-600 px-4 py-2.5 rounded-xl transition group shadow-sm"
                >
                  <span className="text-sm font-medium truncate">{mp.wilaya_name}</span>
                  <svg className="w-3.5 h-3.5 shrink-0 text-blue-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

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