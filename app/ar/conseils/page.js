import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'

// ✅ ISR : cache la page 1h au lieu de recalculer à chaque requête
export const revalidate = 3600

export const metadata = {
  title: 'نصائح طبية في الجزائر | دليل الأطباء',
  description: 'إجابات لأسئلتك الطبية من متخصصين. استشر أفضل الأطباء في الجزائر.',
  // ✅ Canonical + hreflang : Google sait que cette page est la version arabe de /conseils
  alternates: {
    canonical: 'https://www.dalil-atibaa.com/ar/conseils',
    languages: {
      'fr': 'https://www.dalil-atibaa.com/conseils',
      'ar': 'https://www.dalil-atibaa.com/ar/conseils',
      'x-default': 'https://www.dalil-atibaa.com/conseils',
    }
  },
  openGraph: {
    title: 'نصائح طبية في الجزائر | دليل الأطباء',
    description: 'إجابات لأسئلتك الطبية من متخصصين. استشر أفضل الأطباء في الجزائر.',
    url: 'https://www.dalil-atibaa.com/ar/conseils',
    locale: 'ar_DZ',
    type: 'website',
  }
}

export default async function ConseillsArPage() {
  const { data: conseils } = await supabase
    .from('conseils')
    .select('slug, question_ar, specialty_id, specialties(name_fr, name_ar)')
    .eq('is_active', true)
    .eq('lang', 'ar')
    .order('id', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">

      {/* ✅ Bug #26 : SiteHeader partagé — version arabe */}
      <SiteHeader lang="ar" currentPath="/ar/conseils" />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">نصائح طبية</h1>
          <p className="text-gray-500">إجابات لأسئلتك الصحية من متخصصين</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conseils?.map(c => (
            <Link key={c.slug} href={`/ar/conseils/${c.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition h-full">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {/* ✅ Correction : affichage du nom de spécialité en arabe */}
                  {c.specialties?.name_ar || c.specialties?.name_fr}
                </span>
                <p className="mt-3 font-semibold text-gray-800 leading-snug">{c.question_ar}</p>
                {/* ✅ Correction flèche RTL : → indique "aller vers la droite" en arabe */}
                <p className="mt-3 text-sm text-blue-600 font-medium">اقرأ الجواب →</p>
              </div>
            </Link>
          ))}
        </div>

        {(!conseils || conseils.length === 0) && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">لا توجد نصائح متاحة حالياً</p>
          </div>
        )}
      </div>

      {/* ✅ Bug #26 : SiteFooter partagé — version arabe */}
      <SiteFooter lang="ar" />

    </main>
  )
}