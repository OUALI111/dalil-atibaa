import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'نصائح طبية في الجزائر | دليل الأطباء',
  description: 'اعثر على إجابات لأسئلتك الطبية واستشر أفضل الأطباء في الجزائر.',
}

export default async function ConseillsArPage() {
  const { data: conseils } = await supabase
    .from('conseils')
    .select('slug, question_ar, specialty_id, specialties(name_fr)')
    .eq('is_active', true)
    .eq('lang', 'ar')
    .order('id', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">دليل الأطباء</Link>
          <Link href="/recherche" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            ابحث عن طبيب
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">نصائح طبية</h1>
        <p className="text-gray-500 mb-8">إجابات لأسئلتك الصحية من متخصصين</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conseils?.map(c => (
            <Link key={c.slug} href={`/ar/conseils/${c.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {c.specialties?.name_fr}
                </span>
                <p className="mt-3 font-semibold text-gray-800 leading-snug">{c.question_ar}</p>
                <p className="mt-2 text-sm text-blue-600 font-medium">← اقرأ الجواب</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-8">
        <p>2026 دليل الأطباء - دليل الأطباء في الجزائر</p>
      </footer>
    </main>
  )
}