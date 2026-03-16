import { supabase } from '../lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Dalil Atibaa - Annuaire des Médecins en Algérie',
  description: 'Trouvez les meilleurs médecins en Algérie. Filtrez par wilaya et spécialité. Prenez rendez-vous en ligne.',
}

async function getStats() {
  const { count: totalDoctors } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })

  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name_fr, slug')
    .order('name_fr')

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('id, name_fr, slug')
    .order('name_fr')

  return { totalDoctors, specialties, wilayas }
}

export default async function HomePage() {
  const { totalDoctors, specialties, wilayas } = await getStats()

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">
            Dalil Atibaa 🇩🇿
          </h1>
          <span className="text-gray-500 text-sm">
            {totalDoctors} médecins référencés
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-blue-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Trouvez votre médecin en Algérie
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Annuaire complet de {totalDoctors} médecins dans toutes les wilayas
          </p>

          <form action="/recherche" method="GET"
            className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <input
              name="q"
              type="text"
              placeholder="Nom du médecin ou cabinet..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="specialite"
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Toutes spécialités</option>
              {specialties?.map(s => (
                <option key={s.id} value={s.slug}>{s.name_fr}</option>
              ))}
            </select>
            <select
              name="wilaya"
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Toutes les wilayas</option>
              {wilayas?.map(w => (
                <option key={w.id} value={w.slug}>{w.name_fr}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition">
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* SPECIALITES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Parcourir par spécialité
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {specialties?.map(s => (
            <Link
              key={s.id}
              href={`/specialites/${s.slug}`}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:border-blue-500 border border-gray-100 transition">
              <p className="text-sm font-medium text-gray-700">{s.name_fr}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* WILAYAS */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Parcourir par wilaya
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {wilayas?.map(w => (
              <Link
                key={w.id}
                href={`/wilayas/${w.slug}`}
                className="bg-gray-50 rounded-lg p-2 text-center hover:bg-blue-50 hover:text-blue-700 transition text-sm text-gray-600">
                {w.name_fr}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
        <p>© 2025 Dalil Atibaa — Annuaire des médecins en Algérie</p>
      </footer>

    </main>
  )
}
