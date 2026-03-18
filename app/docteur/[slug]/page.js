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
    description: `Consultez ${doctor.name_fr}, ${doctor.specialties?.name_fr} a ${doctor.wilayas?.name_fr}. Services: ${servicesText}. Prenez rendez-vous en ligne.`,
    keywords: `${doctor.name_fr}, ${doctor.specialties?.name_fr} ${doctor.wilayas?.name_fr}, ${servicesText}`,
    alternates: { canonical: `https://dalil-atibaa.vercel.app/docteur/${slug}` },
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
    .order('rating', { ascending: false })
    .limit(6)

  const stars = Math.round(doctor.rating || 0)
  const whatsappNumber = doctor.phone?.replace(/\D/g, '').replace(/^0/, '213')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Physician', 'MedicalBusiness'],
        '@id': `https://dalil-atibaa.vercel.app/docteur/${doctor.slug}`,
        name: doctor.name_fr,
        medicalSpecialty: doctor.specialties?.name_fr,
        telephone: doctor.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: doctor.address,
          addressLocality: doctor.wilayas?.name_fr,
          addressCountry: 'DZ',
        },
        aggregateRating: doctor.rating > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: doctor.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: doctor.reviews_count || 1,
        } : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://dalil-atibaa.vercel.app' },
          { '@type': 'ListItem', position: 2, name: doctor.specialties?.name_fr, item: `https://dalil-atibaa.vercel.app/specialites/${doctor.specialties?.slug}` },
          { '@type': 'ListItem', position: 3, name: doctor.wilayas?.name_fr, item: `https://dalil-atibaa.vercel.app/wilayas/${doctor.wilayas?.slug}` },
          { '@type': 'ListItem', position: 4, name: doctor.name_fr, item: `https://dalil-atibaa.vercel.app/docteur/${doctor.slug}` },
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Comment prendre rendez-vous avec ${doctor.name_fr} ?`,
            acceptedAnswer: { '@type': 'Answer', text: `Appelez directement au ${doctor.phone || 'numero disponible'}.` }
          },
          {
            '@type': 'Question',
            name: `Ou se trouve ${doctor.name_fr} ?`,
            acceptedAnswer: { '@type': 'Answer', text: `${doctor.name_fr} est situe a ${doctor.wilayas?.name_fr}${doctor.address ? `, ${doctor.address}` : ''}.` }
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

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa
          </Link>
          <Link href="/recherche"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rechercher
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-400 flex gap-2 flex-wrap items-center">
        <Link href="/" className="hover:text-blue-600 transition">Accueil</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href={`/specialites/${doctor.specialties?.slug}`} className="hover:text-blue-600 transition">{doctor.specialties?.name_fr}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href={`/wilayas/${doctor.wilayas?.slug}`} className="hover:text-blue-600 transition">{doctor.wilayas?.name_fr}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-600 truncate max-w-xs">{doctor.name_fr}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-5">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-md">
                {doctor.name_fr?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                      {doctor.name_fr}
                    </h1>
                    <Link href={`/specialites/${doctor.specialties?.slug}`}
                      className="text-blue-600 font-medium text-sm hover:underline mt-0.5 inline-block">
                      {doctor.specialties?.name_fr}
                    </Link>
                  </div>
                  {doctor.is_verified && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200 font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Verifie
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className={`w-4 h-4 ${i <= stars ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{doctor.rating}</span>
                  <span className="text-sm text-gray-400">/ 5</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
              {doctor.wilayas && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm">
                    <span className="font-medium text-gray-800">{doctor.wilayas.name_fr}</span>
                    {doctor.address && <span className="text-gray-500"> — {doctor.address}</span>}
                  </span>
                </div>
              )}
              {doctor.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a href={`tel:${doctor.phone}`} className="text-sm font-semibold text-green-600 hover:underline">
                    {doctor.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3 lg:hidden">
              <a href={`tel:${doctor.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Appeler
              </a>
              {doctor.phone && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {services && services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Nos Services
              </h2>
              <div className="flex flex-wrap gap-2">
                {services.map(s => (
                  <span key={s.slug}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-sm font-medium">
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {s.name_fr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {doctor.latitude && doctor.longitude && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Localisation
              </h2>
              <a href={doctor.google_map_url || `https://maps.google.com/maps?q=${doctor.latitude},${doctor.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800 group-hover:text-blue-700 transition">Voir sur Google Maps</p>
                  <p className="text-sm text-gray-500 mt-0.5">{doctor.address || doctor.wilayas?.name_fr}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {similar && similar.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {doctor.specialties?.name_fr} a {doctor.wilayas?.name_fr}
                </h2>
                <Link href={`/specialites/${doctor.specialties?.slug}/${doctor.wilayas?.slug}`}
                  className="text-sm text-blue-600 hover:underline font-medium">
                  Voir tous
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {similar.map(s => (
                  <Link key={s.id} href={`/docteur/${s.slug}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                        {s.name_fr?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{s.name_fr}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-gray-500">{s.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {doctor.name_fr} - {doctor.specialties?.name_fr} a {doctor.wilayas?.name_fr}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {doctor.name_fr} est un {doctor.specialties?.name_fr} base a {doctor.wilayas?.name_fr}, Algerie.
              {doctor.address && ` Le cabinet est situe au ${doctor.address}.`}
              {services && services.length > 0 && ` Les services proposes incluent: ${services.map(s => s.name_fr).join(', ')}.`}
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-700 text-sm mb-1">Comment prendre rendez-vous avec {doctor.name_fr} ?</p>
                <p className="text-gray-500 text-sm">Appelez directement au {doctor.phone || 'numero disponible'} pour prendre rendez-vous a {doctor.wilayas?.name_fr}.</p>
              </div>
              {services && services.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-gray-700 text-sm mb-1">Quels services propose {doctor.name_fr} ?</p>
                  <p className="text-gray-500 text-sm">{services.map(s => s.name_fr).join(', ')}.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="space-y-4">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-4">
            <h2 className="font-bold text-gray-900 mb-4 text-center">Prendre rendez-vous</h2>
            <a href={`tel:${doctor.phone}`}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appeler
            </a>
            {doctor.phone && (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Informations</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Specialite
                </div>
                <span className="font-medium text-gray-800 text-sm">{doctor.specialties?.name_fr}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Wilaya
                </div>
                <span className="font-medium text-gray-800 text-sm">{doctor.wilayas?.name_fr}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Note
                </div>
                <span className="font-semibold text-yellow-500 text-sm">{doctor.rating}/5</span>
              </div>
            </div>
          </div>

          {services && services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Mots-cles</p>
              <div className="flex flex-wrap gap-1.5">
                {services.map(s => (
                  <span key={s.slug} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                    {s.name_fr}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-8">
        <p>2025 Dalil Atibaa - Annuaire des medecins en Algerie</p>
      </footer>

    </main>
  )
}