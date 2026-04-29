import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Conseils Médicaux en Algérie | Dalil Atibaa',
  description: 'Trouvez des réponses à vos questions médicales et consultez les meilleurs médecins en Algérie.',
}

export default async function ConseillsPage() {
  const { data: conseils, error } = await supabase
    .from('conseils')
    .select('slug, question_fr, specialty_id, specialties(name_fr)')
    .eq('is_active', true)
    .order('id', { ascending: false })

  console.log('conseils:', conseils)
  console.log('error:', error)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">Dalil Atibaa</Link>
          <Link href="/recherche" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            Rechercher un médecin
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conseils Médicaux</h1>
        <p className="text-gray-500 mb-8">Réponses à vos questions de santé par nos experts</p>

        <p className="text-sm text-gray-400 mb-4">Total: {conseils?.length || 0} articles</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conseils?.map(c => (
            <Link key={c.slug} href={`/conseils/${c.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {c.specialties?.name_fr}
                </span>
                <p className="mt-3 font-semibold text-gray-800 leading-snug">{c.question_fr}</p>
                <p className="mt-2 text-sm text-blue-600 font-medium">Lire la réponse →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-8">
        <p>2026 Dalil Atibaa - Annuaire des médecins en Algérie</p>
      </footer>
    </main>
  )
}