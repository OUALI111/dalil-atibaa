import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function parseSlug(slug) {
  const wilayas = ['alger', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'setif', 'tizi-ouzou', 'bejaia', 'jijel', 'skikda', 'el-oued', 'biskra', 'mostaganem']
  for (const w of wilayas) {
    if (slug.endsWith('-' + w)) {
      return { wilayaSlug: w, specialtySlug: slug.replace('-' + w, '') }
    }
  }
  return null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) return { title: 'Médecins en Algérie | Dalil Atibaa' }

  const { data: page } = await supabase
    .from('meilleurs_pages')
    .select('meta_title, meta_description')
    .eq('specialty_slug', parsed.specialtySlug)
    .eq('wilaya_slug', parsed.wilayaSlug)
    .single()

  if (!page) return { title: 'Médecins en Algérie | Dalil Atibaa' }

  return {
    title: page.meta_title,
    description: page.meta_description,
    alternates: { canonical: `https://www.dalil-atibaa.com/meilleurs/${slug}` },
    openGraph: { title: page.meta_title, description: page.meta_description }
  }
}

export default async function MeilleursPage({ params }) {
  const { slug } = await params

  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const { specialtySlug, wilayaSlug } = parsed

  const { data: page } = await supabase
    .from('meilleurs_pages')
    .select('*')
    .eq('specialty_slug', specialtySlug)
    .eq('wilaya_slug', wilayaSlug)
    .eq('is_active', true)
    .single()

  if (!page) notFound()

  const { data: specialty } = await supabase
    .from('specialties')
    .select('id, name_fr, slug')
    .eq('slug', specialtySlug)
    .single()

  const { data: wilaya } = await supabase
    .from('wilayas')
    .select('id, name_fr, slug')
    .eq('slug', wilayaSlug)
    .single()

  const { data: doctors } = specialty?.id && wilaya?.id ? await supabase
    .from('doctors')
    .select('id, name_fr, slug, rating, address, phone, wilayas(name_fr), specialties(name_fr)')
    .eq('specialty_id', specialty.id)
    .eq('wilaya_id', wilaya.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(20) : { data: [] }

  const { data: autresWilayas } = await supabase
    .from('meilleurs_pages')
    .select('wilaya_slug, wilaya_name')
    .eq('specialty_slug', specialtySlug)
    .eq('is_active', true)
    .neq('wilaya_slug', wilayaSlug)

  const faq = page.faq || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
      },
      {
        '@type': 'MedicalWebPage',
        name: page.meta_title,
        description: page.meta_description,
        url: `https://www.dalil-atibaa.com/meilleurs/${slug}`,
        about: { '@type': 'MedicalSpecialty', name: page.specialty_name }
      }
    ]
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Dalil Atibaa</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/conseils" className="hidden sm:block text-sm text-gray-600 hover:text-blue-600 transition">💡 Conseils</Link>
            <Link href="/recherche" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Rechercher</Link>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-400 flex gap-2 items-center flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition">Accueil</Link>
        <span>›</span>
        <Link href={`/specialites/${specialty?.slug}`} className="hover:text-blue-600 transition">{page.specialty_name}</Link>
        <span>›</span>
        <span className="text-gray-600">{page.specialty_name} à {page.wilaya_name}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* HERO */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                {doctors?.length || 0} praticiens référencés
              </span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                {page.wilaya_name}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-2">
              Meilleurs {page.specialty_name} à {page.wilaya_name}
            </h1>
            <p className="text-blue-100 text-sm">Liste complète mise à jour en {new Date().getFullYear()}</p>
          </div>

          {/* INTRO */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-5">
              {page.intro_fr
                .split(/\n\n+/)
                .filter(p => p.trim())
                .map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed text-base">
                    {p.trim()}
                  </p>
                ))}
            </div>
            {page.communes && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Zones couvertes
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">{page.communes}</p>
              </div>
            )}
          </div>

          {/* LISTE MÉDECINS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-xl mb-6">
              {page.specialty_name} à {page.wilaya_name} — Liste complète
            </h2>
            {doctors && doctors.length > 0 ? (
              <div className="space-y-3">
                {doctors.map((d, i) => (
                  <Link key={d.id} href={`/docteur/${d.slug}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {d.name_fr?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition">{d.name_fr}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.address || d.wilayas?.name_fr}</p>
                        {d.phone && <p className="text-xs text-green-600 font-medium mt-0.5">{d.phone}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-bold text-gray-700">{d.rating || 0}</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">#{i + 1}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Aucun praticien référencé pour le moment</p>
                <Link href="/contact" className="text-blue-600 text-sm mt-2 block hover:underline">
                  Référencer mon cabinet →
                </Link>
              </div>
            )}
          </div>

          {/* FAQ */}
          {faq.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-xl mb-6">
                Questions fréquentes — {page.specialty_name} à {page.wilaya_name}
              </h2>
              <div className="space-y-4">
                {faq.map((item, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-5">
                    <p className="font-semibold text-gray-800 mb-2">{item.q}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white sticky top-20">
            <h3 className="font-bold text-lg mb-2">
              Trouver un {page.specialty_name.slice(0, -1)} à {page.wilaya_name}
            </h3>
            <p className="text-blue-100 text-sm mb-5">
              {doctors?.length || 0} praticiens disponibles dans notre annuaire
            </p>
            <Link href={`/recherche?specialite=${specialty?.slug}&wilaya=${wilaya?.slug}`}
              className="block text-center bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition text-sm">
              Voir tous les résultats →
            </Link>
            <Link href="/recherche"
              className="block text-center text-white/80 hover:text-white text-sm mt-3 transition">
              Recherche avancée →
            </Link>
          </div>

          {autresWilayas && autresWilayas.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Autres wilayas</p>
              <div className="space-y-2">
                {autresWilayas.map(w => (
                  <Link key={w.wilaya_slug} href={`/meilleurs/${specialtySlug}-${w.wilaya_slug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition group">
                    <span className="text-sm text-gray-700 group-hover:text-blue-600">
                      {page.specialty_name} à {w.wilaya_name}
                    </span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm mb-1">Référencer votre cabinet</p>
                <p className="text-amber-700 text-xs leading-relaxed mb-2">
                  Vous êtes {page.specialty_name.slice(0, -1).toLowerCase()} à {page.wilaya_name} ? Rejoignez notre annuaire gratuitement.
                </p>
                <Link href="/contact" className="text-amber-700 text-xs font-bold hover:underline">
                  Nous contacter →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-bold text-white text-lg mb-2">Dalil Atibaa</p>
          <div className="flex justify-center gap-6 text-sm flex-wrap mt-3">
            <Link href="/" className="hover:text-white transition">Accueil</Link>
            <Link href="/conseils" className="hover:text-white transition">Conseils</Link>
            <Link href="/recherche" className="hover:text-white transition">Recherche</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-xs mt-6">© 2026 Dalil Atibaa — Tous droits réservés</p>
        </div>
      </footer>
    </main>
  )
}