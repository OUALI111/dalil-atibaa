import { supabase } from '../lib/supabase'
import Link from 'next/link'
import HeroSearchWrapper from './components/HeroSearchWrapper'

export const revalidate = 3600 // Revalider toutes les heures


export const metadata = {
  title: 'Dalil Atibaa | Trouvez un Médecin en Algérie & Prenez un Rendez-vous',
  description: 'Trouvez un médecin en Algérie parmi des professionnels de santé référencés. Dentistes, cardiologues, gynécologues dans les 58 wilayas. Adresses et téléphones disponibles.',
  keywords: 'médecin algérie, annuaire médical algérie, trouver médecin, dentiste algérie, cardiologue algérie, wilaya',
  alternates: {
    canonical: 'https://www.dalil-atibaa.com',
  },
  openGraph: {
    title: 'Dalil Atibaa — Annuaire des Médecins en Algérie',
    description: 'Trouvez un médecin en Algérie parmi 1500+ professionnels. Dentistes, cardiologues, gynécologues dans les 58 wilayas.',
    url: 'https://www.dalil-atibaa.com',
    siteName: 'Dalil Atibaa',
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dalil Atibaa — Annuaire des Médecins en Algérie',
    description: 'Trouvez un médecin en Algérie parmi 1500+ professionnels dans les 58 wilayas.',
  },
}

async function getStats() {
  // ✅ Promise.all() : les 3 requêtes s'exécutent EN PARALLÈLE au lieu de l'une après l'autre.
  // Avant : ~200ms + ~200ms + ~200ms = ~600ms séquentiels
  // Après : max(200ms, 200ms, 200ms) = ~200ms simultanés → gain ~400ms sur le TTFB
  const [
    { count: totalDoctorsRaw },
    { data: specialtiesRaw },
    { data: wilayasRaw },
  ] = await Promise.all([
    // ✅ totalDoctors : head:true = COUNT PostgreSQL direct, jamais limité
    supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),

    // ✅ SPECIALTIES : table de 32 lignes max → jamais limitée
    // doctors(count) = COUNT imbriqué côté PostgreSQL, prouvé fonctionnel via REST API
    supabase
      .from('specialties')
      .select('id, name_fr, slug, doctors(count)')
      .order('name_fr'),

    // ✅ WILAYAS : table de 58 lignes max → jamais limitée
    // Même approche : doctors(count) imbriqué, toujours correct
    supabase
      .from('wilayas')
      .select('id, name_fr, slug, doctors(count)')
      .order('name_fr'),
  ])

  // Filtre : garder uniquement les spécialités ayant au moins 1 médecin
  const specialties = specialtiesRaw
    ?.filter(s => (s.doctors?.[0]?.count ?? 0) > 0)
    .map(({ id, name_fr, slug }) => ({ id, name_fr, slug })) ?? []

  // Filtre : garder uniquement les wilayas ayant au moins 1 médecin
  const wilayas = wilayasRaw
    ?.filter(w => (w.doctors?.[0]?.count ?? 0) > 0)
    .map(({ id, name_fr, slug }) => ({ id, name_fr, slug })) ?? []

  // ✅ Fallback 0 : si Supabase retourne null (erreur réseau, table vide), on n'affiche pas "undefined"
  const totalDoctors = totalDoctorsRaw ?? 0

  return { totalDoctors, specialties, wilayas }
}


async function getMeilleursPages() {
  const { data } = await supabase
    .from('meilleurs_pages')
    .select('specialty_slug, wilaya_slug, specialty_name, wilaya_name')
    .eq('is_active', true)
    .order('specialty_slug')
  return data || []
}

const specialtyIcons = {
  dentiste: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c-2.5 0-4.5 1.5-4.5 4 0 1.5.5 3 1 4.5.5 1.5 1 3 1.5 3s.5-.5 1-1.5c.5 1 .5 1.5 1 1.5s1-1.5 1.5-3c.5-1.5 1-3 1-4.5 0-2.5-2-4-4.5-4z" />
    </svg>
  ),
  cardiologue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  pediatre: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  gynecologue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  generaliste: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
    </svg>
  ),
  ophtalmologue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
}

const topSpecialtySlugs = ['dentiste', 'cardiologue', 'pediatre', 'gynecologue', 'generaliste', 'ophtalmologue']
const popularWilayaSlugs = ['alger', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'setif', 'tizi-ouzou']

const faqItems = [
  {
    q: 'Comment trouver un médecin près de chez moi ?',
    a: 'Sélectionnez votre wilaya et la spécialité souhaitée pour trouver rapidement un médecin près de vous en Algérie. Les résultats sont triés pour vous aider à choisir facilement.',
  },
  {
    q: 'Est-ce que Dalil Atibaa est gratuit ?',
    a: 'Oui, la recherche de médecins sur Dalil Atibaa est entièrement gratuite pour les patients.',
  },
  {
    q: 'Comment contacter un médecin ?',
    a: "Chaque fiche médecin contient le numéro de téléphone, l'adresse du cabinet et les détails pour prendre rendez-vous facilement.",
  },
  {
    q: 'Comment prendre rendez-vous avec un médecin ?',
    a: 'Choisissez un médecin et appelez directement au numéro indiqué sur sa fiche pour prendre rendez-vous.',
  },
  {
    q: 'Peut-on rechercher un médecin par spécialité et wilaya ?',
    a: 'Oui, Dalil Atibaa vous permet de rechercher un médecin en Algérie par spécialité et par wilaya pour trouver rapidement un professionnel de santé près de vous.',
  },
  {
    q: 'Pourquoi utiliser Dalil Atibaa ?',
    a: 'Dalil Atibaa vous permet de trouver rapidement un médecin en Algérie, comparer les profils et contacter le cabinet directement par téléphone.',
  },
  {
    q: 'Comment ajouter mon cabinet médical ?',
    a: 'Contactez-nous pour référencer votre cabinet sur Dalil Atibaa et être visible par des milliers de patients chaque mois.',
  },
  {
    q: 'Quelles wilayas sont couvertes ?',
    a: "Dalil Atibaa couvre les 58 wilayas d'Algérie incluant Alger, Oran, Constantine, Annaba, Blida, Batna, Sétif et toutes les autres.",
  },
]



export default async function HomePage() {
  const [{ totalDoctors, specialties, wilayas }, meilleursPages] = await Promise.all([
    getStats(),
    getMeilleursPages(),
  ])

  const topSpecialties = specialties?.filter(s => topSpecialtySlugs.includes(s.slug)) || []
  const otherSpecialties = specialties?.filter(s => !topSpecialtySlugs.includes(s.slug)) || []
  const popularWilayas = wilayas?.filter(w => popularWilayaSlugs.includes(w.slug)) || []
  const otherWilayas = wilayas?.filter(w => !popularWilayaSlugs.includes(w.slug)) || []

  // Grouper les pages meilleurs par spécialité
  const meilleursGrouped = meilleursPages.reduce((acc, p) => {
    if (!acc[p.specialty_slug]) acc[p.specialty_slug] = { name: p.specialty_name, wilayas: [] }
    acc[p.specialty_slug].wilayas.push({ slug: p.wilaya_slug, name: p.wilaya_name })
    return acc
  }, {})

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        url: 'https://www.dalil-atibaa.com',
        name: 'Dalil Atibaa',
        description: 'Annuaire des médecins en Algérie',
        inLanguage: 'fr-DZ',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://www.dalil-atibaa.com/recherche?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'Dalil Atibaa',
        url: 'https://www.dalil-atibaa.com',
        description: `Annuaire médical de référence en Algérie. ${totalDoctors || '+'} médecins référencés.`,
        areaServed: { '@type': 'Country', name: 'Algeria' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ✅ Hydration fix : script JSON-LD à l'intérieur du <main> — pas de Fragment nu à la racine */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* HERO */}
        <section style={{ backgroundColor: '#1A87D8' }} className="text-white pt-4 pb-12 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          {/* Navigation haute dans le Hero */}
          <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
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

          <div className="max-w-4xl mx-auto text-center relative">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Trouvez votre médecin<br />
              <span className="text-blue-200">en Algérie</span>
            </h1>
            <p className="text-blue-100 text-lg mb-10">
              {/* ✅ Bug #22 : double espace supprimé ("les  wilayas" → "les wilayas") */}
              Recherchez parmi les meilleurs médecins dans tous les wilayas

            </p>

            {/* FORMULAIRE + GPS (style Doctolib) */}
            <HeroSearchWrapper specialties={specialties} wilayas={wilayas} />

            {/* Raccourcis spécialités */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {topSpecialties.slice(0, 5).map(s => (
                <Link key={s.slug} href={`/specialites/${s.slug}`}
                  className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full transition backdrop-blur-sm">
                  {s.name_fr}
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* STATS */}
        <section className="bg-white border-b border-gray-100 py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">
              Votre santé, notre engagement au quotidien
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
              <div className="flex flex-col items-center">
                <p style={{ color: '#1A87D8' }} className="text-4xl font-extrabold">
                  {/* ✅ Fallback '+' : affiche quelque chose de positif même si le count échoue */}
                  {totalDoctors > 0 ? totalDoctors.toLocaleString('fr-DZ') : '+'}
                </p>
                <p className="text-gray-600 text-sm mt-2 max-w-[240px]">
                  soignants qui facilitent vos rendez-vous
                </p>
              </div>
              <div className="flex flex-col items-center border-t border-b md:border-t-0 md:border-b-0 border-gray-100 py-6 md:py-0">
                <p style={{ color: '#1A87D8' }} className="text-4xl font-extrabold">{wilayas?.length || 0}</p>
                <p className="text-gray-600 text-sm mt-2 max-w-[240px]">
                  wilayas où trouver un médecin proche de vous
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p style={{ color: '#1A87D8' }} className="text-4xl font-extrabold">{specialties?.length || 0}</p>
                <p className="text-gray-600 text-sm mt-2 max-w-[240px]">
                  spécialités pour prendre soin de votre famille
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SPÉCIALITÉS */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Parcourir par spécialité</h2>
          <p className="text-gray-500 mb-6">{specialties?.length} spécialité(s) disponible(s) dans notre annuaire</p>

          {topSpecialties.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {topSpecialties.map(s => (
                <Link key={s.id} href={`/specialites/${s.slug}`}
                  className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:border-blue-400 border border-gray-100 transition group">
                  <div style={{ backgroundColor: '#e8f4fc', color: '#1A87D8' }} className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition">
                    {specialtyIcons[s.slug] || (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition leading-tight">{s.name_fr}</p>
                </Link>
              ))}
            </div>
          )}

          {otherSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {otherSpecialties.map(s => (
                <Link key={s.id} href={`/specialites/${s.slug}`}
                  className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition">
                  {s.name_fr}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ══════════════ RECHERCHES POPULAIRES ══════════════ */}
        {meilleursPages.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Recherches populaires</h2>
                <p className="text-gray-500 text-sm mt-1">Les meilleures fiches médecins par ville, sélectionnées pour vous</p>
              </div>
              <span className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Mis à jour {new Date().getFullYear()}
              </span>
            </div>

            <div className="space-y-5">
              {Object.entries(meilleursGrouped).map(([spSlug, { name, wilayas: wList }]) => (
                <div key={spSlug} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* En-tête spécialité */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                    <div style={{ backgroundColor: '#1A87D8' }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M12 12v3m0 0v3m0-3h3m-3 0H9" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">Meilleurs {name}</p>
                      <p className="text-xs text-gray-500">{wList.length} ville{wList.length > 1 ? 's' : ''} disponible{wList.length > 1 ? 's' : ''}</p>
                    </div>
                    <Link href={`/specialites/${spSlug}`}
                      aria-label={`Voir tous les médecins ${name}`}
                      style={{ color: '#1A87D8' }}
                      className="text-xs hover:underline font-medium shrink-0">
                      Voir tous →
                    </Link>
                  </div>

                  {/* Grille des villes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-50">
                    {wList.map(w => (
                      <Link
                        key={w.slug}
                        href={`/meilleurs/${spSlug}-${w.slug}`}
                        aria-label={`Voir les meilleurs ${name} à ${w.name}`}
                        className="flex items-center gap-2.5 px-4 py-3.5 hover:bg-blue-50 transition group"
                      >
                        <div style={{ backgroundColor: '#1A87D8' }} className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition truncate">{w.name}</p>
                          <p className="text-xs text-gray-500 group-hover:text-blue-500 transition" aria-hidden="true">Voir la liste →</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WILAYAS */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Parcourir par wilaya</h2>
            <p className="text-gray-500 mb-6">{wilayas?.length} wilaya(s) avec des médecins référencés</p>

            {popularWilayas.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {popularWilayas.map(w => (
                  <Link key={w.slug} href={`/wilayas/${w.slug}`}
                    aria-label={`Voir les médecins à ${w.name_fr}`}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 text-center hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition group">
                    <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition">{w.name_fr}</p>
                    <p className="text-xs text-blue-500 mt-1" aria-hidden="true">Voir les médecins →</p>
                  </Link>
                ))}
              </div>
            )}

            {otherWilayas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {otherWilayas.map(w => (
                  <Link key={w.id} href={`/wilayas/${w.slug}`}
                    className="bg-gray-50 border border-gray-200 text-gray-600 text-sm px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition">
                    {w.name_fr}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Comment ça marche ?</h2>
          <p className="text-gray-500 text-center mb-10">Trouvez votre médecin en 3 étapes simples</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Recherchez', desc: 'Entrez votre wilaya et la spécialité souhaitée dans le moteur de recherche.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
              { step: '2', title: 'Comparez', desc: 'Consultez les fiches détaillées, les notes et les avis des patients.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4" /></svg> },
              { step: '3', title: 'Contactez', desc: 'Appelez directement le cabinet ou écrivez sur WhatsApp pour prendre RDV.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div style={{ backgroundColor: '#e8f4fc', color: '#1A87D8' }} className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-blue-500 mb-2">ÉTAPE {item.step}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ + SEO CONTENT */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Annuaire médical en Algérie</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Dalil Atibaa est le premier annuaire médical en ligne dédié à l&apos;Algérie.
                Trouvez rapidement un médecin dans votre wilaya, consultez ses coordonnées et prenez rendez-vous directement par téléphone.
              </p>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Questions fréquentes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {faqItems.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="font-semibold text-gray-700 mb-2 text-sm">{item.q}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ backgroundColor: '#0f172a' }} className="text-gray-400 py-16 border-t border-gray-800">
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