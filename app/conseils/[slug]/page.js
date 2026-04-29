import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: conseil } = await supabase
    .from('conseils')
    .select('question_fr, answer_fr, specialties(name_fr), wilayas(name_fr)')
    .eq('slug', slug)
    .single()

  if (!conseil) return { title: 'Conseil introuvable' }

  return {
    title: `${conseil.question_fr} | Dalil Atibaa`,
    description: conseil.answer_fr?.substring(0, 160),
    alternates: { canonical: `https://www.dalil-atibaa.com/conseils/${slug}` },
  }
}

export default async function ConseilPage({ params }) {
  const { slug } = await params

  const { data: conseil } = await supabase
    .from('conseils')
    .select('*, specialties(id, name_fr, slug), wilayas(id, name_fr, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!conseil) notFound()

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, name_fr, slug, rating, address, wilayas(name_fr)')
    .eq('specialty_id', conseil.specialty_id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
.order('id', { ascending: false })
    .limit(6)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: conseil.question_fr,
      acceptedAnswer: {
        '@type': 'Answer',
        text: conseil.answer_fr,
      }
    }]
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">Dalil Atibaa</Link>
          <Link href="/recherche" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            Rechercher un médecin
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-400 flex gap-2 items-center flex-wrap">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <span>›</span>
        <Link href="/conseils" className="hover:text-blue-600">Conseils</Link>
        <span>›</span>
        <span className="text-gray-600 truncate max-w-xs">{conseil.question_fr}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {conseil.specialties?.name_fr}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-4 leading-snug">
              {conseil.question_fr}
            </h1>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-gray-700 leading-relaxed text-base">
                {conseil.answer_fr}
              </p>
            </div>
          </div>

          {doctors && doctors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">
                Meilleurs {conseil.specialties?.name_fr}s disponibles
              </h2>
              <div className="space-y-3">
                {doctors.map(d => (
                  <Link key={d.id} href={`/docteur/${d.slug}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {d.name_fr?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{d.name_fr}</p>
                        <p className="text-sm text-gray-500">{d.wilayas?.name_fr}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700">{d.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-blue-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Besoin d'un médecin ?</h3>
            <p className="text-blue-100 text-sm mb-4">Trouvez le meilleur spécialiste près de chez vous</p>
            <Link href={`/specialites/${conseil.specialties?.slug}`}
              className="block text-center bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition">
              Voir tous les {conseil.specialties?.name_fr}s
            </Link>
          </div>
        </div>

      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-8">
        <p>2026 Dalil Atibaa - Annuaire des médecins en Algérie</p>
      </footer>
    </main>
  )
}