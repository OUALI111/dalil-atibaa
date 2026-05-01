import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'نصائح طبية في الجزائر | دليل الأطباء',
  description: 'إجابات لأسئلتك الطبية من متخصصين. استشر أفضل الأطباء في الجزائر.',
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

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">دليل الأطباء</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/conseils" className="hidden sm:block text-sm text-gray-600 hover:text-blue-600 transition">
              🇫🇷 Français
            </Link>
            <Link href="/recherche" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              ابحث عن طبيب
            </Link>
          </div>
        </div>
      </header>

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
                  {c.specialties?.name_fr}
                </span>
                <p className="mt-3 font-semibold text-gray-800 leading-snug">{c.question_ar}</p>
                <p className="mt-3 text-sm text-blue-600 font-medium">← اقرأ الجواب</p>
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

      <footer className="bg-gray-900 text-gray-400 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-bold text-white text-lg mb-2">دليل الأطباء</p>
          <div className="flex justify-center gap-6 text-sm flex-wrap mt-3">
            <Link href="/" className="hover:text-white transition">الرئيسية</Link>
            <Link href="/ar/conseils" className="hover:text-white transition">نصائح طبية</Link>
            <Link href="/recherche" className="hover:text-white transition">بحث</Link>
            <Link href="/contact" className="hover:text-white transition">اتصل بنا</Link>
          </div>
          <p className="text-xs mt-6">© 2026 دليل الأطباء — جميع الحقوق محفوظة</p>
        </div>
      </footer>

    </main>
  )
}