import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
export const revalidate = 3600

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
  const needsSections = page.needs_sections || []
  const communesSections = page.communes_sections || []

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
      },
      {
        '@type': 'ItemList',
        itemListElement: (doctors || []).map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Physician',
            name: d.name_fr,
            url: `https://www.dalil-atibaa.com/docteur/${d.slug}`
          }
        }))
      }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gray-50">      <header style={{ backgroundColor: '#1A87D8' }} className="sticky top-0 z-50 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/">
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
          <div className="flex items-center gap-3">
            <Link 
              href="/recherche" 
              className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow-sm"
            >
              Trouver un médecin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* HERO */}
          <div style={{ backgroundColor: '#1A87D8' }} className="rounded-2xl p-8 text-white">
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

          {/* INTRO COURTE */}
          {page.intro_short && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="space-y-4">
                {page.intro_short
                  .split(/\n\n+/)
                  .filter(p => p.trim())
                  .map((p, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-base">
                      {p.trim()}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* LISTE MÉDECINS — EN PREMIER */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="liste">
            <h2 className="font-bold text-gray-900 text-xl mb-6">
              Liste des meilleurs {page.specialty_name.toLowerCase()} à {page.wilaya_name}
            </h2>
            {doctors && doctors.length > 0 ? (
              <div className="space-y-3">
                {doctors.map((d, i) => (
                  <Link key={d.id} href={`/docteur/${d.slug}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group">
                      <div style={{ backgroundColor: '#1A87D8' }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
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

          {/* CRITÈRES DE SÉLECTION */}
          {page.selection_criteria && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="font-bold text-gray-900 text-lg mb-4">
                Comment sont sélectionnés les {page.specialty_name.toLowerCase()} ?
              </h2>
              <div className="space-y-2 text-gray-600 leading-relaxed text-sm">
                {page.selection_criteria.split(/\n\n+/).map((block, i) => {
                  if (block.includes('•')) {
                    return (
                      <ul key={i} className="space-y-1.5 my-3">
                        {block.split('\n').filter(l => l.trim()).map((line, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">✓</span>
                            <span>{line.replace('•', '').trim()}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  return <p key={i}>{block.trim()}</p>
                })}
              </div>
            </div>
          )}

          {/* BESOINS SPÉCIFIQUES */}
          {needsSections.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="font-bold text-gray-900 text-xl mb-6">
                Trouver un {page.specialty_name.slice(0, -1).toLowerCase()} à {page.wilaya_name} selon votre besoin
              </h2>
              <div className="space-y-5">
                {needsSections.map((s, i) => (
                  <div key={i} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
                    <h3 className="font-semibold text-gray-800 text-base mb-1.5">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAR COMMUNE */}
          {communesSections.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="font-bold text-gray-900 text-xl mb-6">
                {page.specialty_name} par commune à {page.wilaya_name}
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {communesSections.map((c, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1.5">
                      {page.specialty_name.slice(0, -1)} à {c.commune}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <div style={{ backgroundColor: '#1A87D8' }} className="rounded-2xl p-6 text-white sticky top-20">
            <h3 className="font-bold text-lg mb-2">
              Trouver un {page.specialty_name.slice(0, -1)} à {page.wilaya_name}
            </h3>
            <p className="text-blue-100 text-sm mb-5">
              {doctors?.length || 0} praticiens disponibles dans notre annuaire
            </p>
            <a href="#liste"
              style={{ color: '#1E293B' }}
              className="block text-center bg-white font-bold py-3 rounded-xl hover:bg-blue-50 transition text-sm">
              Voir la liste →
            </a>
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