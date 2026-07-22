import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'

// ✅ ISR 1h : les conseils changent rarement, inutile de recalculer à chaque visite
export const revalidate = 3600

export const metadata = {
  title: 'Conseils Médicaux en Algérie | Dalil Atibaa',
  description: 'Trouvez des réponses à vos questions médicales et consultez les meilleurs médecins en Algérie.',
  // ✅ Bug #17 : canonical manquant — sans lui, Google peut indexer plusieurs variantes de l'URL
  alternates: {
    canonical: 'https://www.dalil-atibaa.com/conseils',
    languages: {
      'fr': 'https://www.dalil-atibaa.com/conseils',
      'ar': 'https://www.dalil-atibaa.com/ar/conseils',
      'x-default': 'https://www.dalil-atibaa.com/conseils',
    }
  },
  openGraph: {
    title: 'Conseils Médicaux en Algérie | Dalil Atibaa',
    description: 'Trouvez des réponses à vos questions médicales et consultez les meilleurs médecins en Algérie.',
    url: 'https://www.dalil-atibaa.com/conseils',
    type: 'website',
  }
}

export default async function ConseillsPage() {
  const { data: conseils } = await supabase
    .from('conseils')
    .select('slug, question_fr, specialty_id, specialties(name_fr)')
    .eq('is_active', true)
    .eq('lang', 'fr')
    .order('id', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ✅ Bug #26 : SiteHeader partagé — plus de duplication */}
      <SiteHeader currentPath="/conseils" />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conseils Médicaux</h1>
          <p className="text-gray-500">Réponses à vos questions de santé par nos experts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conseils?.map(c => (
            <Link key={c.slug} href={`/conseils/${c.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition h-full">
                <span style={{ color: '#1A87D8', backgroundColor: '#e8f4fc' }} className="text-xs font-medium px-3 py-1 rounded-full">
                  {c.specialties?.name_fr}
                </span>
                <p className="mt-3 font-semibold text-gray-800 leading-snug">{c.question_fr}</p>
                <p style={{ color: '#1A87D8' }} className="mt-3 text-sm font-medium">Lire la réponse →</p>
              </div>
            </Link>
          ))}
        </div>

        {(!conseils || conseils.length === 0) && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Aucun conseil disponible pour le moment</p>
          </div>
        )}
      </div>

      {/* ✅ Bug #26 : SiteFooter partagé — plus de duplication */}
      <SiteFooter />
    </main>
  )
}