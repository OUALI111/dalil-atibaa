import { supabase } from '../lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Dalil Atibaa - Annuaire des Médecins en Algérie',
description: 'Annuaire de médecins en Algérie. Trouvez un médecin par wilaya et spécialité. Adresses et téléphones.',
  alternates: {
    canonical: 'https://dalil-atibaa.vercel.app',
  },
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
            Recherchez facilement un médecin ou un spécialiste près de chez vous.
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
{/* SEO CONTENT */}
<section className="max-w-6xl mx-auto px-4 py-12">
  <div className="bg-white rounded-2xl p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      Annuaire médical en Algérie
    </h2>
    <p className="text-gray-600 mb-6">
      Dalil Atibaa est un annuaire médical en ligne dédié à la recherche de médecins en Algérie. 
      La plateforme permet aux patients de trouver rapidement un médecin par spécialité et par wilaya, d’accéder à ses coordonnées, 
      à l’adresse de son cabinet et de le contacter directement par téléphone pour prendre rendez-vous. Que vous recherchiez un médecin généraliste, un cardiologue, un dermatologue, un pédiatre ou un autre spécialiste, Dalil Atibaa facilite l’accès à l’information médicale locale et vous aide à identifier les professionnels de santé disponibles près de chez vous.

Grâce à une base de données en constante évolution, 
l’annuaire recense aujourd’hui plus de 5000 médecins répartis dans les 58 wilayas d’Algérie. 
Chaque fiche médecin présente les informations essentielles pour permettre aux patients de trouver facilement un professionnel de santé selon leur besoin et leur localisation. L’objectif de Dalil Atibaa est de simplifier la recherche de médecins en Algérie et d’offrir un accès rapide et fiable aux coordonnées des praticiens dans toutes les régions du pays.

    </p>
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      Questions fréquentes
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-semibold text-gray-700 mb-2">
          Comment trouver un médecin près de chez moi ?
        </p>
        <p className="text-gray-500 text-sm">
          Utilisez notre moteur de recherche, sélectionnez votre wilaya
          et votre spécialité souhaitée pour trouver les médecins disponibles près de vous.
        </p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-semibold text-gray-700 mb-2">
          Est-ce que Dalil Atibaa est gratuit ?
        </p>
        <p className="text-gray-500 text-sm">
          Oui, la consultation de l annuaire est entièrement gratuite pour les patients.
        </p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-semibold text-gray-700 mb-2">
          Quelles wilayas sont couvertes ?
        </p>
        <p className="text-gray-500 text-sm">
          Dalil Atibaa couvre les 58 wilayas d Algérie incluant Alger, Oran,
          Constantine, Annaba, Blida et toutes les autres wilayas.
        </p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-semibold text-gray-700 mb-2">
          Comment ajouter mon cabinet médical ?
        </p>
        <p className="text-gray-500 text-sm">
          Contactez-nous pour référencer votre cabinet sur Dalil Atibaa
          et être visible par des milliers de patients chaque mois.
        </p>
      </div>
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
