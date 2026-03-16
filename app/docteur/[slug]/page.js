import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: doctor } = await supabase
    .from('doctors')
    .select('name_fr, specialties(name_fr), wilayas(name_fr)')
    .eq('slug', slug)
    .single()

  if (!doctor) return { title: 'Médecin introuvable' }

  return {
    title: `${doctor.name_fr} - ${doctor.specialties?.name_fr} à ${doctor.wilayas?.name_fr} | Dalil Atibaa`,
    description: `Consultez le profil de ${doctor.name_fr}, ${doctor.specialties?.name_fr} à ${doctor.wilayas?.name_fr}. Adresse, téléphone et prise de rendez-vous.`,
  }
}

export default async function DoctorPage({ params }) {
  const { slug } = await params

  const { data: doctor } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating, reviews_count,
      google_map_url, latitude, longitude, is_dentflow, is_verified,
      specialties(name_fr, slug),
      wilayas(name_fr, slug)
    `)
    .eq('slug', slug)
    .single()

  if (!doctor) notFound()

  // أطباء مشابهون
  const { data: similar } = await supabase
    .from('doctors')
    .select('id, name_fr, slug, rating, specialties(name_fr), wilayas(name_fr)')
    .eq('specialty_id', doctor.specialty_id)
    .eq('wilaya_id', doctor.wilaya_id)
    .neq('id', doctor.id)
    .limit(3)

  const stars = Math.round(doctor.rating || 0)

  // Schema JSON-LD للـ SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.name_fr,
    medicalSpecialty: doctor.specialties?.name_fr,
    address: {
      '@type': 'PostalAddress',
      addressLocality: doctor.wilayas?.name_fr,
      addressCountry: 'DZ',
      streetAddress: doctor.address,
    },
    telephone: doctor.phone,
    aggregateRating: doctor.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: doctor.rating,
      bestRating: 5,
      ratingCount: doctor.reviews_count || 1,
    } : undefined,
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa 🇩🇿
          </Link>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="max-w-4xl mx-auto px-4 py-3 text-sm text-gray-500 flex gap-2">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <span>›</span>
        <Link href={`/specialites/${doctor.specialties?.slug}`}
          className="hover:text-blue-600">
          {doctor.specialties?.name_fr}
        </Link>
        <span>›</span>
        <Link href={`/wilayas/${doctor.wilayas?.slug}`}
          className="hover:text-blue-600">
          {doctor.wilayas?.name_fr}
        </Link>
        <span>›</span>
        <span className="text-gray-800">{doctor.name_fr}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* COLONNE PRINCIPALE */}
        <div className="md:col-span-2 space-y-4">

          {/* CARTE PRINCIPALE */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl flex-shrink-0">
                {doctor.name_fr?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {doctor.name_fr}
                  </h1>
                  {doctor.is_verified && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      ✓ Vérifié
                    </span>
                  )}
                </div>
                <p className="text-blue-600 font-medium mt-1">
                  {doctor.specialties?.name_fr}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i}
                      className={i <= stars ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>
                      ★
                    </span>
                  ))}
                  <span className="text-gray-500 ml-1">
                    {doctor.rating} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* INFOS */}
            <div className="mt-6 space-y-3 border-t pt-4">
              {doctor.wilayas && (
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-xl">📍</span>
                  <span>{doctor.wilayas.name_fr}
                    {doctor.address && ` — ${doctor.address}`}
                  </span>
                </div>
              )}
              {doctor.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-xl">📞</span>
                  <a href={`tel:${doctor.phone}`}
                    className="text-green-600 font-semibold hover:underline">
                    {doctor.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* CARTE MAPS */}
          {doctor.latitude && doctor.longitude && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="font-semibold text-gray-800 mb-3">📍 Localisation</h2>
              <iframe
                src={`https://maps.google.com/maps?q=${doctor.latitude},${doctor.longitude}&z=15&output=embed`}
                width="100%"
                height="250"
                className="rounded-xl border-0"
                loading="lazy"
              />
              {doctor.google_map_url && (
                <a href={doctor.google_map_url} target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                  Ouvrir dans Google Maps →
                </a>
              )}
            </div>
          )}

          {/* SIMILAIRES */}
          {similar && similar.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                Médecins similaires à {doctor.wilayas?.name_fr}
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
                    <span className="ml-auto text-yellow-400">★ {s.rating}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">

          {/* BOUTON RENDEZ-VOUS */}
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <h2 className="font-semibold text-gray-800 mb-4">Prendre rendez-vous</h2>
            {doctor.is_dentflow ? (
              <a href="#"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
                Réserver en ligne
              </a>
            ) : (
              <a href={`tel:${doctor.phone}`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition">
                📞 Appeler
              </a>
            )}
          </div>

          {/* INFOS RAPIDES */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Informations</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Spécialité</span>
                <span className="font-medium">{doctor.specialties?.name_fr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wilaya</span>
                <span className="font-medium">{doctor.wilayas?.name_fr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Note</span>
                <span className="font-medium text-yellow-500">★ {doctor.rating}/5</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm mt-8">
        <p>© 2025 Dalil Atibaa — Annuaire des médecins en Algérie</p>
      </footer>

    </main>
  )
}