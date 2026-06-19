import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: doctor } = await supabase
    .from('doctors')
    .select('name_fr, name_ar, specialty_id, specialties(name_fr, name_ar), wilayas(name_fr, name_ar)')
    .eq('slug', slug)
    .single()

  if (!doctor) return { title: 'طبيب غير موجود' }

  const displayName = doctor.name_ar || doctor.name_fr

  return {
    title: `${displayName} - ${doctor.specialties?.name_ar} في ${doctor.wilayas?.name_ar} | دليل الأطباء`,
    description: `احجز موعدك مع ${displayName}، ${doctor.specialties?.name_ar} في ${doctor.wilayas?.name_ar}. اتصل مباشرة على دليل أطباء الجزائر.`,
    alternates: {
      canonical: `https://www.dalil-atibaa.com/ar/docteur/${slug}`,
      languages: {
        'fr': `https://www.dalil-atibaa.com/docteur/${slug}`,
        'ar': `https://www.dalil-atibaa.com/ar/docteur/${slug}`,
        'x-default': `https://www.dalil-atibaa.com/docteur/${slug}`,
      }
    },
    openGraph: {
      title: `${displayName} - ${doctor.specialties?.name_ar} في ${doctor.wilayas?.name_ar}`,
      description: `احجز موعدك مع ${displayName} في ${doctor.wilayas?.name_ar}`,
      locale: 'ar_DZ',
    }
  }
}

export default async function DoctorArPage({ params }) {
  const { slug } = await params

  const { data: doctor } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, name_ar, slug, address, address_ar, phone, rating, reviews_count,
      google_map_url, latitude, longitude, is_verified,
      specialty_id, wilaya_id,
      specialties(id, name_fr, name_ar, slug),
      wilayas(name_fr, name_ar, slug)
    `)
    .eq('slug', slug)
    .single()

  if (!doctor) notFound()

  const displayName = doctor.name_ar || doctor.name_fr
  const displayAddress = doctor.address_ar || doctor.address

  const { data: services } = await supabase
    .from('services')
    .select('name_fr')
    .eq('specialty_id', doctor.specialty_id)

  const { data: similar } = await supabase
    .from('doctors')
    .select('id, name_fr, name_ar, slug, rating, wilayas(name_ar)')
    .eq('specialty_id', doctor.specialty_id)
    .eq('wilaya_id', doctor.wilaya_id)
    .neq('id', doctor.id)
    .order('rating', { ascending: false })
    .limit(6)

  const stars = Math.round(doctor.rating || 0)
  const whatsappNumber = doctor.phone?.replace(/\D/g, '').replace(/^0/, '213')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Physician', 'MedicalBusiness'],
        '@id': `https://www.dalil-atibaa.com/ar/docteur/${doctor.slug}`,
        name: displayName,
        inLanguage: 'ar',
        medicalSpecialty: doctor.specialties?.name_ar,
        telephone: doctor.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: displayAddress,
          addressLocality: doctor.wilayas?.name_ar,
          addressCountry: 'DZ',
        },
        aggregateRating: doctor.rating > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: doctor.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: doctor.reviews_count || 1,
        } : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://www.dalil-atibaa.com/ar' },
          { '@type': 'ListItem', position: 2, name: doctor.specialties?.name_ar, item: `https://www.dalil-atibaa.com/ar/specialites/${doctor.specialties?.slug}` },
          { '@type': 'ListItem', position: 3, name: doctor.wilayas?.name_ar, item: `https://www.dalil-atibaa.com/ar/wilayas/${doctor.wilayas?.slug}` },
          { '@type': 'ListItem', position: 4, name: displayName, item: `https://www.dalil-atibaa.com/ar/docteur/${doctor.slug}` },
        ]
      },
      {
        '@type': 'FAQPage',
        inLanguage: 'ar',
        mainEntity: [
          {
            '@type': 'Question',
            name: `كيف أحجز موعداً مع ${displayName} ؟`,
            acceptedAnswer: { '@type': 'Answer', text: `اتصل مباشرة على الرقم ${doctor.phone} لحجز موعدك مع ${displayName} في ${doctor.wilayas?.name_ar}.` }
          },
          {
            '@type': 'Question',
            name: `أين يقع ${displayName} ؟`,
            acceptedAnswer: { '@type': 'Answer', text: `${displayName} يمارس في ${doctor.wilayas?.name_ar}${displayAddress ? `، ${displayAddress}` : ''}.` }
          },
        ]
      }
    ]
  }

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">دليل الأطباء</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/docteur/${slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition">
              🇫🇷 Français
            </Link>
            <Link href="/recherche" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              ابحث عن طبيب
            </Link>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-400 flex gap-2 items-center flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition">الرئيسية</Link>
        <span>›</span>
        <Link href={`/ar/specialites/${doctor.specialties?.slug}`} className="hover:text-blue-600 transition">{doctor.specialties?.name_ar}</Link>
        <span>›</span>
        <Link href={`/ar/wilayas/${doctor.wilayas?.slug}`} className="hover:text-blue-600 transition">{doctor.wilayas?.name_ar}</Link>
        <span>›</span>
        <span className="text-gray-600 truncate max-w-xs">{displayName}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* بطاقة الطبيب */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-md">
                {displayName?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">{displayName}</h1>
                    <Link href={`/ar/specialites/${doctor.specialties?.slug}`}
                      className="text-blue-600 font-medium text-sm hover:underline mt-0.5 inline-block">
                      {doctor.specialties?.name_ar}
                    </Link>
                  </div>
                  {doctor.is_verified && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200 font-medium">
                      ✓ موثق
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className={`w-4 h-4 ${i <= stars ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm font-semibold text-gray-700">{doctor.rating}</span>
                  <span className="text-sm text-gray-400">/ 5</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <span className="text-sm">
                  <span className="font-medium text-gray-800">{doctor.wilayas?.name_ar}</span>
                  {displayAddress && <span className="text-gray-500"> — {displayAddress}</span>}
                </span>
              </div>
              {doctor.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a href={`tel:${doctor.phone}`} className="text-sm font-semibold text-green-600 hover:underline" dir="ltr">
                    {doctor.phone}
                  </a>
                </div>
              )}
            </div>

            {/* أزرار موبايل */}
            <div className="mt-5 flex gap-3 lg:hidden">
              <a href={`tel:${doctor.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm">
                📞 اتصل
              </a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm">
                💬 واتساب
              </a>
            </div>
          </div>

          {/* الخدمات */}
          {services && services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">الخدمات المقدمة</h2>
              <div className="flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-sm font-medium" dir="ltr">
                    ✓ {s.name_fr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* الخريطة */}
          {doctor.google_map_url && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <a href={doctor.google_map_url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📍</div>
                    <p className="text-blue-600 font-semibold text-sm">عرض على خرائط Google</p>
                    <p className="text-blue-400 text-xs mt-1">{displayAddress || doctor.wilayas?.name_ar}</p>
                  </div>
                  <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 shadow-lg flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-700">Google Maps</span>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3 group-hover:bg-blue-50 transition">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{displayAddress || doctor.wilayas?.name_ar}</p>
                    <p className="text-xs text-gray-400">{doctor.wilayas?.name_ar} — الجزائر</p>
                  </div>
                </div>
              </a>
            </div>
          )}

          {/* أطباء مشابهون */}
          {similar && similar.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">
                  أطباء {doctor.specialties?.name_ar} في {doctor.wilayas?.name_ar}
                </h2>
                <Link href={`/ar/specialites/${doctor.specialties?.slug}`} className="text-sm text-blue-600 hover:underline">
                  ← عرض الكل
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {similar.map(s => {
                  const simName = s.name_ar || s.name_fr
                  return (
                    <Link key={s.id} href={`/ar/docteur/${s.slug}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                          {simName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{simName}</p>
                          <p className="text-xs text-gray-500">{s.wilayas?.name_ar}</p>
                        </div>
                        <span className="text-xs text-yellow-500 font-bold">★ {s.rating || 0}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* نص SEO */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {displayName} — {doctor.specialties?.name_ar} في {doctor.wilayas?.name_ar}
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                {displayName} هو {doctor.specialties?.name_ar} يمارس في {doctor.wilayas?.name_ar}، الجزائر.
                {displayAddress && ` العيادة تقع في ${displayAddress}.`}
                {services && services.length > 0 && ` يقدم الخدمات التالية : ${services.map(s => s.name_fr).join('، ')}.`}
              </p>
              <p>
                لحجز موعد مع {displayName} في {doctor.wilayas?.name_ar}،
                اتصل مباشرة على <a href={`tel:${doctor.phone}`} className="text-blue-600 font-semibold" dir="ltr">{doctor.phone}</a>.
                {doctor.rating > 0 && ` تقييم الطبيب ${doctor.rating}/5 من مرضاه على دليل الأطباء.`}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 text-sm mb-1">كيف أحجز موعداً مع {displayName} ؟</p>
                <p className="text-gray-500 text-sm">
                  اتصل مباشرة على <a href={`tel:${doctor.phone}`} className="text-blue-600 font-medium" dir="ltr">{doctor.phone}</a> لحجز موعدك في {doctor.wilayas?.name_ar}.
                  {displayAddress && ` العيادة في ${displayAddress}.`}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 text-sm mb-1">أين يقع {displayName} ؟</p>
                <p className="text-gray-500 text-sm">
                  {displayName} يمارس في {doctor.wilayas?.name_ar}{displayAddress ? `، ${displayAddress}` : ''}.
                  {doctor.google_map_url && <> <a href={doctor.google_map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">عرض على الخريطة ←</a></>}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="font-semibold text-blue-800 text-sm mb-1">
                  أطباء {doctor.specialties?.name_ar} آخرون في {doctor.wilayas?.name_ar}
                </p>
                <Link href={`/ar/specialites/${doctor.specialties?.slug}`} className="text-blue-600 text-sm hover:underline">
                  عرض كل أطباء {doctor.specialties?.name_ar} في {doctor.wilayas?.name_ar} ←
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white sticky top-20">
            <h2 className="font-bold text-lg mb-4 text-center">احجز موعدك</h2>
            <a href={`tel:${doctor.phone}`}
              className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 py-3 rounded-xl font-bold mb-3 hover:bg-blue-50 transition">
              📞 اتصل الآن
            </a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition">
              💬 واتساب
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">معلومات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">التخصص</span>
                <span className="font-medium text-gray-800 text-sm">{doctor.specialties?.name_ar}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">الولاية</span>
                <span className="font-medium text-gray-800 text-sm">{doctor.wilayas?.name_ar}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500 text-sm">التقييم</span>
                <span className="font-semibold text-yellow-500 text-sm">★ {doctor.rating}/5</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">النسخة الفرنسية</p>
            <Link href={`/docteur/${slug}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition group">
              <span className="text-sm text-gray-700 group-hover:text-blue-600">🇫🇷 Voir en français</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-10 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
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