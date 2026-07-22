import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: conseil } = await supabase
    .from('conseils')
    .select('question_ar, answer_ar, meta_title, meta_description, specialties(name_fr)')
    .eq('slug', slug)
    .single()

  if (!conseil) return { title: 'غير موجود' }

  return {
    title: conseil.meta_title || `${conseil.question_ar} | دليل الأطباء`,
    description: conseil.meta_description || conseil.answer_ar?.substring(0, 160),
    alternates: { canonical: `https://www.dalil-atibaa.com/ar/conseils/${slug}` },
  }
}

function renderContentAr(content) {
  if (!content) return null
  return content.split('\n\n').map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null
    if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter(l => l.trim().startsWith('- '))
      return (
        <ul key={i} className="space-y-2 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-gray-700">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
              <span>{item.replace(/^-\s*/, '')}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.endsWith('،') && !trimmed.endsWith('؟')) {
      return (
        <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-2">
          {trimmed}
        </h2>
      )
    }
    return (
      <p key={i} className="text-gray-600 leading-relaxed">
        {trimmed}
      </p>
    )
  })
}

export default async function ConseilArPage({ params }) {
  const { slug } = await params

  const { data: conseil } = await supabase
    .from('conseils')
    .select('*, specialties(id, name_fr, slug), wilayas(id, name_fr, slug)')
    .eq('slug', slug)
    .eq('lang', 'ar')
    .eq('is_active', true)
    .single()

  if (!conseil) notFound()

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, name_fr, slug, rating, phone, wilayas(name_fr)')
    .eq('specialty_id', conseil.specialty_id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .order('id', { ascending: false })
    .limit(6)

  const { data: relatedConseils } = await supabase
    .from('conseils')
    .select('slug, question_ar, specialties(name_fr)')
    .eq('specialty_id', conseil.specialty_id)
    .eq('is_active', true)
    .eq('lang', 'ar')
    .neq('slug', slug)
    .limit(4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: conseil.question_ar,
      acceptedAnswer: {
        '@type': 'Answer',
        text: conseil.content_ar || conseil.answer_ar,
      }
    }]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gray-50" dir="rtl">

      <header style={{ backgroundColor: '#1A87D8' }} className="sticky top-0 z-50 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <img 
              src="/logo.svg" 
              alt="دليل الأطباء" 
              width="200" 
              height="44" 
              style={{ 
                height: '36px', 
                width: 'auto', 
                filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.95))' 
              }} 
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/recherche" 
              className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow-sm"
            >
              ابحث عن طبيب
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <div style={{ backgroundColor: '#1A87D8' }} className="p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {conseil.specialties?.name_fr}
                </span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  ⏱ {conseil.read_time || 3} دقائق قراءة
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-snug">
                {conseil.question_ar}
              </h1>
            </div>

            <div className="p-8 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">إجابة سريعة</p>
                  <p className="text-gray-700 leading-relaxed font-medium">{conseil.answer_ar}</p>
                </div>
              </div>
            </div>

            {conseil.content_ar && (
              <div className="p-8">
                {renderContentAr(conseil.content_ar)}
              </div>
            )}

            <div className="mx-8 mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div style={{ backgroundColor: '#1A87D8' }} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-1">استشر {conseil.specialties?.name_fr}</p>
                  <p className="text-gray-600 text-sm mb-3">
                    هذه المعلومات عامة. للحصول على تشخيص دقيق استشر متخصصاً.
                  </p>
                  <Link href={`/specialites/${conseil.specialties?.slug}`}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                    ابحث عن {conseil.specialties?.name_fr} ←
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {doctors && doctors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-lg">
                  أفضل أطباء {conseil.specialties?.name_fr} المتاحين
                </h2>
                <Link href={`/specialites/${conseil.specialties?.slug}`}
                  className="text-sm text-blue-600 hover:underline font-medium">
                  ← عرض الكل
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map(d => (
                  <Link key={d.id} href={`/docteur/${d.slug}`}>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {d.name_fr?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate text-sm group-hover:text-blue-700">{d.name_fr}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.wilayas?.name_fr}</p>
                        {d.phone && (
                          <p className="text-xs text-green-600 font-medium mt-0.5">{d.phone}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-bold text-gray-700">{d.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedConseils && relatedConseils.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">مقالات ذات صلة</h2>
              <div className="space-y-3">
                {relatedConseils.map(c => (
                  <Link key={c.slug} href={`/ar/conseils/${c.slug}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 group-hover:text-blue-600 transition font-medium flex-1">
                        {c.question_ar}
                      </p>
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div style={{ backgroundColor: '#1A87D8' }} className="rounded-2xl p-6 text-white sticky top-20">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">تحتاج رأي طبي ؟</h3>
            <p className="text-blue-100 text-sm mb-5 leading-relaxed">
              استشر {conseil.specialties?.name_fr} متخصصاً بالقرب منك في الجزائر.
            </p>
            <Link href={`/specialites/${conseil.specialties?.slug}`}
              className="block text-center bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition text-sm">
              عرض كل أطباء {conseil.specialties?.name_fr}
            </Link>
            <Link href="/recherche"
              className="block text-center text-white/80 hover:text-white text-sm mt-3 transition">
              ← بحث متقدم
            </Link>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚕️</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm mb-1">تحذير طبي</p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  المعلومات في هذا المقال للإرشاد فقط. استشر دائماً طبيباً متخصصاً للتشخيص.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">التخصص</p>
            <Link href={`/specialites/${conseil.specialties?.slug}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition">{conseil.specialties?.name_fr}</p>
                <p className="text-xs text-gray-500">← عرض كل الأطباء</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a' }} className="text-gray-400 py-16 border-t border-gray-800 mt-12 text-right">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Colonne 1: À Propos */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <img 
                  src="/logo.svg" 
                  alt="دليل الأطباء" 
                  width="180" 
                  height="40" 
                  style={{ 
                    height: '32px', 
                    width: 'auto', 
                    filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.95))' 
                  }} 
                />
              </Link>
              <p className="text-sm text-gray-300 leading-relaxed">
                دليل الأطباء الأول في الجزائر. ابحث عن طبيب قريب منك وسهل خطوات علاجك اليومية.
              </p>
            </div>

            {/* Colonne 2: Liens Utiles */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">روابط مفيدة</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white transition">الرئيسية</Link></li>
                <li><Link href="/recherche" className="hover:text-white transition">البحث المتقدم</Link></li>
                <li><Link href="/ar/conseils" className="hover:text-white transition">نصائح طبية</Link></li>
                <li><Link href="/a-propos" className="hover:text-white transition">من نحن</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">اتصل بنا</Link></li>
              </ul>
            </div>

            {/* Colonne 3: Spécialités populaires */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">تخصصات شائعة</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/specialites/dentiste" className="hover:text-white transition">طبيب أسنان في الجزائر</Link></li>
                <li><Link href="/specialites/gynecologue" className="hover:text-white transition">طبيب النساء في الجزائر</Link></li>
                <li><Link href="/specialites/cardiologue" className="hover:text-white transition">طبيب القلب في الجزائر</Link></li>
                <li><Link href="/specialites/pediatre" className="hover:text-white transition">طبيب الأطفال في الجزائر</Link></li>
                <li><Link href="/specialites/ophtalmologue" className="hover:text-white transition">طبيب العيون في الجزائر</Link></li>
              </ul>
            </div>

            {/* Colonne 4: B2B Cabinet */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">هل أنت طبيب؟</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                انضم إلى دليل الأطباء لزيادة وضوح عيادتك وتسهيل رعاية مرضاك.
              </p>
              <Link 
                href="/contact" 
                className="inline-block bg-[#1A87D8] hover:bg-[#1571b6] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                تسجيل عيادتي
              </Link>
            </div>

          </div>

          {/* Sub-footer */}
          <div className="border-t border-slate-800 mt-12 pt-10 flex flex-col items-center gap-6 text-center text-xs text-gray-300">
            <div className="space-y-3">
              <p className="font-medium">© 2026 دليل الأطباء — دليل الأطباء في الجزائر. جميع الحقوق محفوظة.</p>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                دليل الأطباء ليس خدمة طوارئ. في حالات الطوارئ الطبية، اتصل بالرقم 14 أو 115.
              </p>
            </div>
            <div className="flex justify-center gap-4 text-gray-400 pt-2">
              <Link href="/a-propos" className="hover:text-white transition">اتفاقية الاستخدام</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition">الدعم</Link>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </>
  )
}