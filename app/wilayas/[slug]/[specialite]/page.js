import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ConseilGpsButton from '../../../conseils/[slug]/ConseilGpsButton'

export async function generateMetadata({ params }) {
  const { slug, specialite } = await params

  const { data: wilayaData } = await supabase
    .from('wilayas').select('name_fr').eq('slug', slug).single()
  const { data: specialty } = await supabase
    .from('specialties').select('name_fr').eq('slug', specialite).single()

  if (!wilayaData || !specialty) return { title: 'Page introuvable' }

  return {
    title: `${specialty.name_fr} a ${wilayaData.name_fr} | Dalil Atibaa`,
    description: `Trouvez les meilleurs ${specialty.name_fr} a ${wilayaData.name_fr}. Adresses, telephones et avis patients.`,
    alternates: {
      canonical: `https://www.dalil-atibaa.com/wilayas/${slug}/${specialite}`,
    },
  }
}

export default async function WilayaSpecialitePage({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  
  const slug = resolvedParams.slug
  const specialite = resolvedParams.specialite
  const currentPage = parseInt(resolvedSearch?.page ?? '0')
  const pageSize = 24
  const from = currentPage * pageSize
  const to = from + pageSize - 1

  const [{ data: wilayaData }, { data: specialty }] = await Promise.all([
    supabase.from('wilayas').select('*').eq('slug', slug).single(),
    supabase.from('specialties').select('*').eq('slug', specialite).single()
  ])

  if (!wilayaData || !specialty) notFound()

  const { data: doctors, count: totalDoctors } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      specialties(name_fr),
      wilayas(name_fr)
    `, { count: 'exact' })
    .eq('wilaya_id', wilayaData.id)
    .eq('specialty_id', specialty.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .range(from, to)

  const total = totalDoctors || 0
  const totalPages = Math.ceil(total / pageSize)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${specialty.name_fr} a ${wilayaData.name_fr}`,
    numberOfItems: total,
    itemListElement: doctors?.map((d, i) => ({
      '@type': 'ListItem',
      position: from + i + 1,
      name: d.name_fr,
      url: `https://www.dalil-atibaa.com/docteur/${d.slug}`,
    }))
  }

  const buildUrl = (page) => 
    `/wilayas/${slug}/${specialite}?page=${page}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

          <h1 className="text-3xl font-bold">
            {specialty.name_fr} a {wilayaData.name_fr}
          </h1>
          <div className="mt-5 flex justify-center sm:justify-start">
            <ConseilGpsButton specialtySlug={specialite}>
              Trouver un {specialty.name_fr} près de moi
            </ConseilGpsButton>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {!doctors || doctors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">
              Aucun {specialty.name_fr} trouve a {wilayaData.name_fr}
            </p>
            <Link href={`/wilayas/${slug}`} className="text-blue-600 hover:underline">
              Voir tous les medecins a {wilayaData.name_fr}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map(doctor => (
                <Link key={doctor.id} href={`/docteur/${doctor.slug}`}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-5">
                    <div className="flex items-start gap-3">
                      <div style={{ backgroundColor: '#1A87D8' }} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {doctor.name_fr?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-800 truncate">
                          {doctor.name_fr}
                        </h2>
                        <p style={{ color: '#1A87D8' }} className="text-sm">{specialty.name_fr}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400">&#9733;</span>
                          <span className="text-sm text-gray-500">{doctor.rating}</span>
                        </div>
                      </div>
                    </div>
                    {doctor.address && (
                      <p className="text-gray-400 text-xs mt-2 truncate">
                        &#128205; {doctor.address}
                      </p>
                    )}
                    {doctor.phone && (
                      <p className="text-green-600 text-sm mt-1">
                        &#128222; {doctor.phone}
                      </p>
                    )}
                    <span style={{ backgroundColor: '#1E293B' }} className="block w-full text-center hover:opacity-90 text-white py-2 rounded-lg text-sm font-medium mt-3 transition">
                      Voir le profil
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {currentPage > 0 && (
                  <a href={buildUrl(currentPage - 1)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
                    Precedent
                  </a>
                )}

                {Array.from({ length: totalPages }, (_, i) => {
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= currentPage - 2 && i <= currentPage + 2)
                  ) {
                    return (
                      <a key={i}
                        href={buildUrl(i)}
                        style={
                          i === currentPage
                            ? { backgroundColor: '#1A87D8', borderColor: '#1A87D8' }
                            : {}
                        }
                        className={`px-4 py-2 rounded-xl border transition ${
                          i === currentPage
                            ? 'text-white font-bold'
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
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {specialty.name_fr} a {wilayaData.name_fr}
          </h2>
          <p className="text-gray-600 mb-4">
            Consultez la liste complete des {specialty.name_fr} a {wilayaData.name_fr}.
            Trouvez facilement un {specialty.name_fr} avec adresse et numero de telephone.
            Prenez rendez-vous rapidement sur Dalil Atibaa.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">
                Comment choisir un {specialty.name_fr} a {wilayaData.name_fr} ?
              </p>
              <p className="text-gray-500 text-sm">
                Consultez les notes et avis patients pour chaque medecin sur Dalil Atibaa.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-700 mb-1">
                Comment prendre rendez-vous ?
              </p>
              <p className="text-gray-500 text-sm">
                Cliquez sur la fiche du medecin pour voir son numero de telephone.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Autres specialites a {wilayaData.name_fr}
          </h2>
          <div className="flex flex-wrap gap-2">
            {['dentiste','ophtalmologue','pediatre','cardiologue',
              'gynecologue','generaliste','dermatologue','neurologue',
              'orl','pneumologue'].map(s =>
              s !== specialite ? (
                <Link key={s} href={`/wilayas/${slug}/${s}`}
                  className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition capitalize">
                  {s}
                </Link>
              ) : null
            )}
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