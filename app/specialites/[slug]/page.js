import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: specialty } = await supabase
    .from('specialties')
    .select('name_fr')
    .eq('slug', slug)
    .single()

  if (!specialty) return { title: 'Spécialité introuvable' }

  return {
    title: `${specialty.name_fr} en Algérie | Dalil Atibaa`,
description: `Liste des ${specialty.name_fr} en Algérie. Adresses, téléphones et avis patients. Prenez rendez-vous facilement.`,
    alternates: {
      canonical: `https://dalil-atibaa.vercel.app/specialites/${slug}`,
    },
  }
}

export default async function SpecialitePage({ params }) {
  const { slug } = await params

  const { data: specialty } = await supabase
    .from('specialties')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!specialty) notFound()

  const { data: doctors } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      wilayas(name_fr, slug)
    `)
    .eq('specialty_id', specialty.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(48)

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('name_fr, slug')
    .order('name_fr')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${specialty.name_fr} en Algérie`,
    numberOfItems: doctors?.length,
    itemListElement: doctors?.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: d.name_fr,
      url: `https://dalil-atibaa.dz/docteur/${d.slug}`,
    }))
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa 🇩🇿
          </Link>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-blue-700 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-blue-200 text-sm mb-2">
            <Link href="/" className="hover:text-white">Accueil</Link>
            {' › '}
            <span>Spécialités</span>
            {' › '}
            <span>{specialty.name_fr}</span>
          </div>
          <h1 className="text-3xl font-bold">
            {specialty.name_fr} en Algérie
          </h1>
          <p className="text-blue-100 mt-2">
            {doctors?.length} médecin(s) référencé(s)
          </p>
        </div>
      </div>

      {/* FILTRES PAR WILAYA */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-gray-500 text-sm mb-3">Filtrer par wilaya:</p>
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href={`/specialites/${slug}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
            Toutes wilayas
          </Link>
          {wilayas?.map(w => (
            <Link key={w.slug}
              href={`/specialites/${slug}/${w.slug}`}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition">
              {w.name_fr}
            </Link>
          ))}
        </div>

        {/* LISTE MEDECINS */}
        {doctors?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Aucun médecin trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors?.map(doctor => (
              <Link key={doctor.id} href={`/docteur/${doctor.slug}`}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                      {doctor.name_fr?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-800 truncate">
                        {doctor.name_fr}
                      </h2>
                      <p className="text-blue-600 text-sm">
                        {doctor.wilayas?.name_fr}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-500">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  {doctor.phone && (
                    <p className="text-green-600 text-sm mt-3">📞 {doctor.phone}</p>
                  )}
                  <span className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium mt-3 transition">
                    Voir le profil →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
{/* SEO CONTENT */}
<div className="max-w-6xl mx-auto px-4 py-8">
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <h2 className="text-xl font-bold text-gray-800 mb-4">
      {specialty.name_fr} en Algérie
    </h2>
    <p className="text-gray-600 mb-4">
      Consultez notre annuaire complet des {specialty.name_fr} en Algérie.
      Trouvez facilement un {specialty.name_fr} près de chez vous avec adresse,
      numéro de téléphone et avis patients. Prenez rendez-vous rapidement.
    </p>
    <h3 className="text-lg font-semibold text-gray-800 mb-3">
      Questions fréquentes
    </h3>
    <div className="space-y-3">
      <div>
        <p className="font-medium text-gray-700">Comment choisir un bon {specialty.name_fr} ?</p>
        <p className="text-gray-500 text-sm mt-1">
          Consultez les avis patients et la note de chaque {specialty.name_fr} sur notre annuaire
          pour faire le meilleur choix.
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-700">Comment prendre rendez-vous avec un {specialty.name_fr} ?</p>
        <p className="text-gray-500 text-sm mt-1">
          Trouvez un {specialty.name_fr} dans votre wilaya et appelez directement
          au numéro affiché sur sa fiche.
        </p>
      </div>
    </div>
  </div>
</div>
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm mt-8">
        <p>© 2025 Dalil Atibaa — Annuaire des médecins en Algérie</p>
      </footer>

    </main>
  )
}
