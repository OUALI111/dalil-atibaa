import { supabase } from '../lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Dalil Atibaa | Trouvez un Médecin en Algérie & Prendre un Rendez-vous',
  description: 'Trouvez un médecin en Algérie parmi des professionnels de santé référencés. Dentistes, cardiologues, gynécologues dans les 58 wilayas. Adresses et téléphones disponibles.',
  keywords: 'médecin algérie, annuaire médical algérie, trouver médecin, dentiste algérie, cardiologue algérie, wilaya',
  alternates: {
    canonical: 'https://dalil-atibaa.vercel.app',
  },
  openGraph: {
    title: 'Dalil Atibaa — Annuaire des Médecins en Algérie',
    description: 'Trouvez un médecin en Algérie parmi 1500+ professionnels. Dentistes, cardiologues, gynécologues dans les 58 wilayas.',
    url: 'https://dalil-atibaa.vercel.app',
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
  const { count: totalDoctors } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { data: specialtiesWithDoctors } = await supabase
    .from('doctors')
    .select('specialty_id')
    .eq('is_active', true)

  const activeSpecialtyIds = [...new Set(specialtiesWithDoctors?.map(d => d.specialty_id) || [])]

  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name_fr, slug')
    .in('id', activeSpecialtyIds)
    .order('name_fr')

  const { data: wilayasWithDoctors } = await supabase
    .from('doctors')
    .select('wilaya_id')
    .eq('is_active', true)

  const activeWilayaIds = [...new Set(wilayasWithDoctors?.map(d => d.wilaya_id) || [])]

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('id, name_fr, slug')
    .in('id', activeWilayaIds)
    .order('name_fr')

  return { totalDoctors, specialties, wilayas }
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
  const { totalDoctors, specialties, wilayas } = await getStats()

  const topSpecialties = specialties?.filter(s => topSpecialtySlugs.includes(s.slug)) || []
  const otherSpecialties = specialties?.filter(s => !topSpecialtySlugs.includes(s.slug)) || []
  const popularWilayas = wilayas?.filter(w => popularWilayaSlugs.includes(w.slug)) || []
  const otherWilayas = wilayas?.filter(w => !popularWilayaSlugs.includes(w.slug)) || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        url: 'https://dalil-atibaa.vercel.app',
        name: 'Dalil Atibaa',
        description: 'Annuaire des médecins en Algérie',
        inLanguage: 'fr-DZ',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://dalil-atibaa.vercel.app/recherche?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'Dalil Atibaa',
        url: 'https://dalil-atibaa.vercel.app',
        description: `Annuaire médical de référence en Algérie. ${totalDoctors} médecins référencés.`,
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen bg-gray-50">

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
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                🇩🇿 {totalDoctors?.toLocaleString()} médecins
              </span>
              <Link href="/recherche"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-14 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Annuaire médical de référence en Algérie
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Trouvez votre médecin<br />
              <span className="text-blue-200">en Algérie</span>
            </h1>
            <p className="text-blue-100 text-lg mb-10">
              Recherchez parmi {totalDoctors?.toLocaleString()} médecins dans les 58 wilayas
            </p>

            {/* FORMULAIRE */}
            <form action="/recherche" method="GET"
              className="bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-3 shadow-2xl">

              <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input name="q" type="text" placeholder="Nom du médecin..."
                  className="w-full text-gray-800 placeholder-gray-400 focus:outline-none text-sm bg-transparent" />
              </div>

              <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                <select name="specialite"
                  className="w-full text-gray-700 focus:outline-none text-sm bg-transparent appearance-none cursor-pointer">
                  <option value="">Spécialité</option>
                  {specialties?.map(s => (
                    <option key={s.id} value={s.slug}>{s.name_fr}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <select name="wilaya"
                  className="w-full text-gray-700 focus:outline-none text-sm bg-transparent appearance-none cursor-pointer">
                  <option value="">Wilaya</option>
                  {wilayas?.map(w => (
                    <option key={w.id} value={w.slug}>{w.name_fr}</option>
                  ))}
                </select>
              </div>

              <button type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition w-full md:w-auto whitespace-nowrap">
                Rechercher
              </button>
            </form>

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
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{totalDoctors?.toLocaleString()}</p>
              <p className="text-gray-500 text-sm mt-1">Médecins</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{wilayas?.length || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Wilayas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{specialties?.length || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Spécialités</p>
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
                  <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-2 transition">
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

        {/* WILAYAS */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Parcourir par wilaya</h2>
            <p className="text-gray-500 mb-6">{wilayas?.length} wilaya(s) avec des médecins référencés</p>

            {popularWilayas.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {popularWilayas.map(w => (
                  <Link key={w.slug} href={`/wilayas/${w.slug}`}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 text-center hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition group">
                    <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition">{w.name_fr}</p>
                    <p className="text-xs text-blue-500 mt-1">Voir les médecins →</p>
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
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
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
        <footer className="bg-gray-900 text-gray-400 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">Dalil Atibaa</span>
              </div>
              <div className="flex gap-6 text-sm flex-wrap justify-center">
                <Link href="/" className="hover:text-white transition">Accueil</Link>
                <Link href="/recherche" className="hover:text-white transition">Recherche</Link>
                <Link href="/a-propos" className="hover:text-white transition">À propos</Link>
                <Link href="/contact" className="hover:text-white transition">Contact</Link>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 text-center text-sm">
              <p>© 2025 Dalil Atibaa — Annuaire des médecins en Algérie</p>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}