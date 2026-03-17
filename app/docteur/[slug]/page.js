import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: doctor } = await supabase
    .from('doctors')
    .select('name_fr, specialty_id, specialties(name_fr), wilayas(name_fr)')
    .eq('slug', slug)
    .single()

  if (!doctor) return { title: 'Medecin introuvable' }

  const { data: services } = await supabase
    .from('services')
    .select('name_fr')
    .eq('specialty_id', doctor.specialty_id)
    .limit(3)

  const servicesText = services?.map(s => s.name_fr).join(', ')

  return {
    title: `${doctor.name_fr} - ${doctor.specialties?.name_fr} a ${doctor.wilayas?.name_fr} | Dalil Atibaa`,
    description: `Consultez ${doctor.name_fr}, ${doctor.specialties?.name_fr} a ${doctor.wilayas?.name_fr}. Services: ${servicesText}. Adresse: ${doctor.address || doctor.wilayas?.name_fr}. Prenez rendez-vous en ligne.`,
    keywords: `${doctor.name_fr}, ${doctor.specialties?.name_fr} ${doctor.wilayas?.name_fr}, ${servicesText}`,
    alternates: {
      canonical: `https://dalil-atibaa.vercel.app/docteur/${slug}`,
    },
    openGraph: {
      title: `${doctor.name_fr} - ${doctor.specialties?.name_fr} a ${doctor.wilayas?.name_fr}`,
      description: `Services: ${servicesText}`,
      type: 'website',
    }
  }
}

export default async function DoctorPage({ params }) {
  const { slug } = await params

  const { data: doctor } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating, reviews_count,
      google_map_url, latitude, longitude, is_dentflow, is_verified,
      specialty_id, wilaya_id,
      specialties(id, name_fr, slug),
      wilayas(name_fr, slug)
    `)
    .eq('slug', slug)
    .single()

  if (!doctor) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('name_fr, slug')
    .eq('specialty_id', doctor.specialty_id)

  const { data: similar } = await supabase
    .from('doctors')
    .select('id, name_fr, slug, rating, specialties(name_fr), wilayas(name_fr)')
    .eq('specialty_id', doctor.specialty_id)
    .eq('wilaya_id', doctor.wilaya_id)
    .neq('id', doctor.id)
    .limit(3)

  const stars = Math.round(doctor.rating || 0)

 const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Physician', 'MedicalBusiness'],
      '@id': `https://dalil-atibaa.vercel.app/docteur/${doctor.slug}`,
      name: doctor.name_fr,
      medicalSpecialty: doctor.specialties?.name_fr,
      description: `${doctor.name_fr}, ${doctor.specialties?.name_fr} à ${doctor.wilayas?.name_fr}`,
      url: `https://dalil-atibaa.vercel.app/docteur/${doctor.slug}`,
      telephone: doctor.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: doctor.address,
        addressLocality: doctor.wilayas?.name_fr,
        addressCountry: 'DZ',
      },
      geo: doctor.latitude && doctor.longitude ? {
        '@type': 'GeoCoordinates',
        latitude: doctor.latitude,
        longitude: doctor.longitude,
      } : undefined,
      aggregateRating: doctor.rating > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: doctor.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: doctor.reviews_count || 1,
      } : undefined,
      hasOfferCatalog: services?.length > 0 ? {
        '@type': 'OfferCatalog',
        name: `Services de ${doctor.specialties?.name_fr}`,
        itemListElement: services.map(s => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MedicalProcedure',
            name: s.name_fr,
          }
        }))
      } : undefined,
      sameAs: doctor.google_map_url ? [doctor.google_map_url] : [],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: 'https://dalil-atibaa.vercel.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: doctor.specialties?.name_fr,
          item: `https://dalil-atibaa.vercel.app/specialites/${doctor.specialties?.slug}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: doctor.wilayas?.name_fr,
          item: `https://dalil-atibaa.vercel.app/wilayas/${doctor.wilayas?.slug}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: doctor.name_fr,
          item: `https://dalil-atibaa.vercel.app/docteur/${doctor.slug}`,
        },
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Comment prendre rendez-vous avec ${doctor.name_fr} ?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Appelez directement au ${doctor.phone || 'numéro disponible'} pour prendre rendez-vous.`,
          }
        },
        {
          '@type': 'Question',
          name: `Où se trouve ${doctor.name_fr} ?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${doctor.name_fr} est situé à ${doctor.wilayas?.name_fr}${doctor.address ? `, ${doctor.address}` : ''}.`,
          }
        },
      ]
    }
  ]
}

  return (
    <main className="min-h-screen bg-gray-50">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-3 text-sm text-gray-500 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <span>›</span>
        <Link href={`/specialites/${doctor.specialties?.slug}`} className="hover:text-blue-600">
          {doctor.specialties?.name_fr}
        </Link>
        <span>›</span>
        <Link href={`/wilayas/${doctor.wilayas?.slug}`} className="hover:text-blue-600">
          {doctor.wilayas?.name_fr}
        </Link>
        <span>›</span>
        <span className="text-gray-800">{doctor.name_fr}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="md:col-span-2 space-y-4">

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl shrink-0">
                {doctor.name_fr?.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  {doctor.name_fr}
                </h1>
                <p className="text-blue-600 font-medium mt-1">
                  {doctor.specialties?.name_fr}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={i <= stars ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>
                      &#9733;
                    </span>
                  ))}
                  <span className="text-gray-500 ml-1">{doctor.rating} / 5</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t pt-4">
              {doctor.wilayas && (
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-xl">&#128205;</span>
                  <span>{doctor.wilayas.name_fr}{doctor.address && ` - ${doctor.address}`}</span>
                </div>
              )}
              {doctor.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">&#128222;</span>
                  <a href={`tel:${doctor.phone}`} className="text-green-600 font-semibold hover:underline">
                    {doctor.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {services && services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Nos Services</h2>
              <div className="grid grid-cols-2 gap-2">
                {services.map(s => (
                  <div key={s.slug} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-blue-500">&#10003;</span>
                    <span className="text-sm text-gray-700">{s.name_fr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {doctor.google_map_url && (
  <div className="bg-white rounded-2xl shadow-sm p-4">
    <h2 className="font-semibold text-gray-800 mb-3">Localisation</h2>
              <a
                      href={doctor.google_map_url}

                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <div className="w-full h-48 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center hover:bg-blue-100 transition cursor-pointer">
                  <span className="text-blue-600 font-medium text-lg">Voir sur Google Maps</span>
                  <span className="text-gray-400 text-sm mt-1">
                    {doctor.address || doctor.wilayas?.name_fr}
                  </span>
                </div>
              </a>
            </div>
          )}

          {similar && similar.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                Medecins similaires
              </h2>
              <div className="space-y-3">
                {similar.map(s => (
                  <Link key={s.id} href={`/docteur/${s.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {s.name_fr?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{s.name_fr}</p>
                      <p className="text-sm text-gray-500">{s.specialties?.name_fr}</p>
                    </div>
                    <span className="ml-auto text-yellow-400">{s.rating}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <h2 className="font-semibold text-gray-800 mb-4">Prendre rendez-vous</h2>
            {doctor.is_dentflow ? (
              <a href="#" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
                Reserver en ligne
              </a>
            ) : (
              <a href={`tel:${doctor.phone}`} className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition">
                Appeler
              </a>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Informations</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Specialite</span>
                <span className="font-medium">{doctor.specialties?.name_fr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wilaya</span>
                <span className="font-medium">{doctor.wilayas?.name_fr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Note</span>
                <span className="font-medium text-yellow-500">{doctor.rating}/5</span>
              </div>
            </div>
          </div>

          {services && services.length > 0 && (
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-sm text-blue-700 font-medium mb-2">Mots-cles:</p>
              <div className="flex flex-wrap gap-1">
                {services.map(s => (
                  <span key={s.slug} className="text-xs bg-white text-blue-600 px-2 py-1 rounded-full border border-blue-200">
                    {s.name_fr}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
{/* SEO CONTENT */}
<div className="max-w-4xl mx-auto px-4 py-8">
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <h2 className="text-xl font-bold text-gray-800 mb-4">
      {doctor.name_fr} - {doctor.specialties?.name_fr} à {doctor.wilayas?.name_fr}
    </h2>
    <p className="text-gray-600 mb-4">
      {doctor.name_fr} est un {doctor.specialties?.name_fr} basé à {doctor.wilayas?.name_fr}, Algérie.
      {doctor.address && ` Le cabinet est situé au ${doctor.address}.`}
      {services && services.length > 0 && ` Les services proposés incluent: ${services.map(s => s.name_fr).join(', ')}.`}
      {` Pour prendre rendez-vous, contactez directement le cabinet au ${doctor.phone || 'numéro indiqué'}.`}
    </p>

    <h3 className="text-lg font-semibold text-gray-800 mb-3">
      Questions fréquentes
    </h3>

    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-medium text-gray-700 mb-1">
          Comment prendre rendez-vous avec {doctor.name_fr} ?
        </p>
        <p className="text-gray-500 text-sm">
          Appelez directement au {doctor.phone || 'numéro indiqué sur la fiche'} pour prendre rendez-vous
          avec {doctor.name_fr} à {doctor.wilayas?.name_fr}.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-medium text-gray-700 mb-1">
          Où se trouve le cabinet de {doctor.name_fr} ?
        </p>
        <p className="text-gray-500 text-sm">
          {doctor.name_fr} exerce à {doctor.wilayas?.name_fr}
          {doctor.address && `, ${doctor.address}`}.
          Utilisez le bouton Google Maps pour obtenir l itinéraire.
        </p>
      </div>

      {services && services.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="font-medium text-gray-700 mb-1">
            Quels services propose {doctor.name_fr} ?
          </p>
          <p className="text-gray-500 text-sm">
            {doctor.name_fr} propose les services suivants: {services.map(s => s.name_fr).join(', ')}.
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-medium text-gray-700 mb-1">
          Quelle est la note de {doctor.name_fr} ?
        </p>
        <p className="text-gray-500 text-sm">
          {doctor.name_fr} a une note de {doctor.rating}/5
          basée sur les avis de patients sur Google Maps.
        </p>
      </div>
    </div>
  </div>
</div>
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm mt-8">
        <p>2025 Dalil Atibaa - Annuaire des medecins en Algerie</p>
      </footer>

    </main>
  )
}