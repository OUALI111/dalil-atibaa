import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = params

  const { data: doctor } = await supabase
    .from('doctors')
    .select('name_fr, specialty_id, specialties(name_fr), wilayas(name_fr)')
    .eq('slug', slug)
    .single()

  if (!doctor) return { title: 'Médecin introuvable' }

  const { data: services } = await supabase
    .from('services')
    .select('name_fr')
    .eq('specialty_id', doctor.specialty_id)
    .limit(3)

  const servicesText = services?.map(s => s.name_fr).join(', ')

  return {
    title: `${doctor.name_fr} - ${doctor.specialties?.name_fr} à ${doctor.wilayas?.name_fr}`,
    description: `Consultez ${doctor.name_fr}, ${doctor.specialties?.name_fr} à ${doctor.wilayas?.name_fr}. Services: ${servicesText}.`,
  }
}

export default async function DoctorPage({ params }) {
  const { slug } = params

  const { data: doctor } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, slug, address, phone, rating,
      google_map_url, latitude, longitude,
      is_dentflow, is_verified,
      specialty_id, wilaya_id,
      specialties(name_fr, slug),
      wilayas(name_fr, slug)
    `)
    .eq('slug', slug)
    .single()

  if (!doctor) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('name_fr, slug')
    .eq('specialty_id', doctor.specialty_id)

  const stars = Math.round(doctor.rating || 0)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Dalil Atibaa 🇩🇿
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* DOCTOR CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold">{doctor.name_fr}</h1>

          <p className="text-blue-600 mt-1">
            {doctor.specialties?.name_fr}
          </p>

          <div className="flex gap-1 mt-2">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-2 text-gray-600">
            <div>📍 {doctor.wilayas?.name_fr} {doctor.address && `- ${doctor.address}`}</div>

            {doctor.phone && (
              <div>
                📞 <a href={`tel:${doctor.phone}`} className="text-green-600">{doctor.phone}</a>
              </div>
            )}
          </div>
        </div>

        {/* SERVICES */}
        {services && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-bold mb-3">Services</h2>

            <div className="grid grid-cols-2 gap-2">
              {services.map(s => (
                <div key={s.slug} className="bg-blue-50 p-2 rounded">
                  {s.name_fr}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAP */}
        {doctor.latitude && doctor.longitude && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-bold mb-3">Localisation</h2>

            <a
              href={`https://maps.google.com/maps?q=${doctor.latitude},${doctor.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-blue-50 p-6 text-center rounded-xl hover:bg-blue-100"
            >
              🗺️ Voir sur Google Maps
            </a>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          {doctor.is_dentflow ? (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl">
              Réserver
            </button>
          ) : (
            <a
              href={`tel:${doctor.phone}`}
              className="bg-green-600 text-white px-6 py-3 rounded-xl inline-block"
            >
              Appeler
            </a>
          )}
        </div>

      </div>

    </main>
  )
}