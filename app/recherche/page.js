import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import HeroSearchWrapper from '../components/HeroSearchWrapper'

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
    // ✅ SEO : bloquer l'indexation de /recherche avec paramètres
    // Pourquoi ? "/recherche?specialite=dentiste&wilaya=alger" montre le même contenu
    // que "/specialites/dentiste/alger" qui est déjà indexée → duplicate content
    // Google peut pénaliser les sites avec du contenu dupliqué.
    // La page /recherche SANS paramètre reste indexée normalement.
    robots: (q || specialite || wilaya)
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

// ✅ CORRECTION BUG CACHE : unstable_cache doit être instancié au niveau MODULE,
// pas à l'intérieur d'une fonction appelée à chaque requête.
// On utilise un Map pour mémoriser une instance de fonction cachée par clé unique.
// Ainsi, deux visiteurs qui cherchent "dentiste à Alger" partagent le même cache.
const searchCacheRegistry = new Map()

function getCachedSearch(cacheKey, fetcher) {
  if (!searchCacheRegistry.has(cacheKey)) {
    const cachedFn = unstable_cache(
      fetcher,
      [cacheKey],
      { revalidate: 3600, tags: ['doctors', cacheKey] }
    )
    searchCacheRegistry.set(cacheKey, cachedFn)
  }
  return searchCacheRegistry.get(cacheKey)
}

async function getDoctorsWithCache({ q, specialite, wilaya, page = 0, lat, lng }) {
  const isGps = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))

  // Si on est en mode GPS, on court-circuite le cache (coordonnées GPS trop uniques)
  if (isGps) {
    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)
    const pageSize = 24

    // Résoudre l'id de la spécialité si présente
    let specId = null
    if (specialite) {
      const { data: spec } = await supabase
        .from('specialties').select('id').eq('slug', specialite).single()
      if (spec) specId = spec.id
    }

    const { data: rpcData, error } = await supabase.rpc('doctors_nearby', {
      user_lat: userLat,
      user_lng: userLng,
      radius_km: 50,
      specialty_filter: specId,
      result_limit: pageSize,
      result_offset: page * pageSize
    })

    if (error) {
      console.error("Erreur RPC doctors_nearby :", error)
      return { doctors: [], total: 0, pageSize }
    }

    const formatted = (rpcData || []).map(doc => ({
      id: doc.id,
      name_fr: doc.name_fr,
      slug: doc.slug,
      address: doc.address,
      phone: doc.phone,
      rating: doc.rating,
      distance_km: doc.distance_km,
      specialties: { name_fr: doc.specialty_name },
      wilayas: { name_fr: doc.wilaya_name }
    }))

    return { doctors: formatted, total: formatted.length, pageSize }
  }

  // ✅ Mode recherche normale : on utilise le cache registry au niveau module
  const cacheKey = `search-${q}-${specialite}-${wilaya}-${page}`

  const cachedFn = getCachedSearch(cacheKey, async () => {
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
  })

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
  const lat = params?.lat || ''
  const lng = params?.lng || ''
  const page = parseInt(params?.page || '0')

  const [{ doctors, total, pageSize }, { specialties, wilayas }] = await Promise.all([
    getDoctorsWithCache({ q, specialite, wilaya, page, lat, lng }),
    getFilters()
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ═══ BARRE DE RECHERCHE (HeroSearch avec GPS intégré) ═══ */}
      <div style={{ backgroundColor: '#1A87D8' }} className="py-5 px-4">
        <div className="max-w-6xl mx-auto mb-5">
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
        <div className="max-w-4xl mx-auto">
          <HeroSearchWrapper
            specialties={specialties}
            wilayas={wilayas}
            defaultSpecialty={specialite}
            defaultWilaya={wilaya}
          />
        </div>
      </div>

      {/* ═══ RÉSULTATS ═══ */}
      <div id="static-results-container" className="max-w-6xl mx-auto px-4 py-8">

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
                    <div style={{ backgroundColor: '#1A87D8' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {doctor.name_fr?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* ✅ Bug #20 : <p> au lieu de <h2> — 24 <h2> sur une page dilue le SEO.
                          La page a déjà un <h1> unique. Les noms de médecins sont des données, pas des titres de section. */}
                      <p className="font-semibold text-gray-800 truncate text-sm">
                        {doctor.name_fr}
                      </p>
                      <p style={{ color: '#1A87D8' }} className="text-xs font-medium">
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
                        {/* ✅ Bug #24 : troncature conditionnelle — pas de '...' si l'adresse est courte */}
                        {doctor.address && (doctor.address.length > 30
                          ? ` — ${doctor.address.substring(0, 30)}…`
                          : ` — ${doctor.address}`)}
                      </p>
                    )}
                    {doctor.distance_km !== undefined && (
                      <p className="text-emerald-600 text-xs font-bold flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        À {doctor.distance_km < 1 ? `${Math.round(doctor.distance_km * 1000)} m` : `${doctor.distance_km.toFixed(1)} km`} de vous
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
                    <span style={{ backgroundColor: '#1E293B' }} className="block w-full text-center hover:opacity-90 text-white py-2 rounded-lg text-sm font-medium transition">
                      Voir le profil →
                    </span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ✅ PAGINATION avec <Link> Next.js : prefetch automatique au survol → navigation quasi-instantanée */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {page > 0 && (
              <Link href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition text-sm">
                ← Précédent
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return (
                <Link key={pageNum}
                  href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${pageNum}`}
                  style={pageNum === page ? { backgroundColor: '#1A87D8', borderColor: '#1A87D8' } : {}}
                  className={`px-4 py-2 rounded-xl border transition text-sm ${
                    pageNum === page
                      ? 'text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'
                  }`}>
                  {pageNum + 1}
                </Link>
              )
            })}
            {page < totalPages - 1 && (
              <Link href={`/recherche?q=${q}&specialite=${specialite}&wilaya=${wilaya}&page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition text-sm">
                Suivant →
              </Link>
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
            ].map((item) => (
              // ✅ key stable : la question est unique et invariante
              <div key={item.q} className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-1 text-sm">{item.q}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.a}</p>
              </div>
            ))}
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
  )
}