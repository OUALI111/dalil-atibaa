import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'

export const revalidate = 3600

// ✅ cache() React : déduplique la requête entre generateMetadata() et DoctorArPage()
// Sans cache(), les deux fonctions faisaient 2 requêtes SQL séparées pour le même slug.
const getDoctorArBySlug = cache(async (slug) => {
  const { data: doctor } = await supabase
    .from('doctors')
    .select(`
      id, name_fr, name_ar, slug, address, address_ar, phone, rating, reviews_count,
      google_map_url, latitude, longitude, is_verified, booking_url,
      specialty_id, wilaya_id,
      specialties(id, name_fr, name_ar, slug),
      wilayas(name_fr, name_ar, slug)
    `)
    .eq('slug', slug)
    .single()
  return doctor
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  // ✅ getDoctorArBySlug (cached) → zéro requête supplémentaire si DoctorArPage a déjà appelé cette fonction
  const doctor = await getDoctorArBySlug(slug)

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

  // ✅ getDoctorArBySlug (cached) : si generateMetadata a déjà fait la requête,
  // React réutilise le résultat en mémoire → 0 requête SQL supplémentaire
  const doctor = await getDoctorArBySlug(slug)

  if (!doctor) {
    // ✅ Vérification dans la table des redirections d'anciens slugs (parité avec la version FR)
    const { data: slugRedirect } = await supabase
      .from('slug_redirects')
      .select('new_slug, specialty_slug, wilaya_slug')
      .eq('old_slug', slug)
      .single()

    if (slugRedirect) {
      // Redirection vers l'URL arabe si un nouveau slug existe,
      // sinon vers la page de spécialité française (pas encore de pages spécialité arabes)
      const destination = slugRedirect.new_slug
        ? `/ar/docteur/${slugRedirect.new_slug}`
        : `/specialites/${slugRedirect.specialty_slug}/${slugRedirect.wilaya_slug}`

      redirect(destination)
    }

    notFound()
  }

  const displayName = doctor.name_ar || doctor.name_fr
  const displayAddress = doctor.address_ar || doctor.address

  // ✅ Promise.all : services et similar en parallèle au lieu de séquentiel
  const [{ data: services }, { data: similar }] = await Promise.all([
    supabase
      .from('services')
      .select('name_fr, name_ar')
      .eq('specialty_id', doctor.specialty_id),
    supabase
      .from('doctors')
      .select('id, name_fr, name_ar, slug, rating, wilayas(name_ar)')
      .eq('specialty_id', doctor.specialty_id)
      .eq('wilaya_id', doctor.wilaya_id)
      .neq('id', doctor.id)
      .order('rating', { ascending: false })
      .limit(6)
  ])

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
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://www.dalil-atibaa.com/' },
          { '@type': 'ListItem', position: 2, name: doctor.specialties?.name_ar, item: `https://www.dalil-atibaa.com/specialites/${doctor.specialties?.slug}` },
          { '@type': 'ListItem', position: 3, name: doctor.wilayas?.name_ar, item: `https://www.dalil-atibaa.com/wilayas/${doctor.wilayas?.slug}` },
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gray-50" dir="rtl">
        
        {/* HEADER */}
        <header style={{ backgroundColor: '#1A87D8' }} className="sticky top-0 z-50 py-4 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
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
            <div className="flex items-center gap-4">
              <Link 
                href={`/docteur/${slug}`} 
                className="text-white hover:text-blue-100 text-sm font-semibold transition flex items-center gap-1.5"
              >
                🇫🇷 Français
              </Link>
              <Link 
                href="/recherche" 
                className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow-sm"
              >
                ابحث عن طبيب
              </Link>
            </div>
          </div>
        </header>


      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* بطاقة الطبيب */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-5">
              <div style={{ backgroundColor: '#1A87D8' }} className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-md">
                {displayName?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">{displayName}</h1>
                    {/* ✅ Redirige vers la recherche filtrée car /ar/specialites/ n'existe pas encore */}
                    <Link href={`/recherche?specialite=${doctor.specialties?.slug}`}
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
                    // ✅ key stable : le numéro de l'étoile est unique et ne change jamais
                    <svg key={`star-${i}`} className={`w-4 h-4 ${i <= stars ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
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
            {doctor.phone && (
              <div className="mt-5 space-y-3 lg:hidden">
                {doctor.booking_url && (
                  <a 
                    href={doctor.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition text-xs shadow-sm"
                  >
                    <span>حجز موعد عبر الإنترنت (تأكيد فوري بنقرة واحدة)</span>
                  </a>
                )}
                <div className="flex gap-3">
                  <a href={`tel:${doctor.phone}`}
                    style={{ backgroundColor: '#1E293B' }}
                    className="flex-1 flex items-center justify-center gap-2 hover:opacity-90 text-white py-3 rounded-xl font-semibold text-sm">
                    📞 اتصل
                  </a>
                  {/* ✅ Guard whatsappNumber pour éviter href="wa.me/undefined" */}
                  {whatsappNumber && (
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm">
                      💬 واتساب
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* الخدمات */}
          {services && services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">الخدمات المقدمة</h2>
              <div className="flex flex-wrap gap-2">
                {services.map((s, i) => (
                  // ✅ key stable : slug ou name unique, index en fallback uniquement
                  <span key={s.slug || s.name_ar || s.name_fr || i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-sm font-medium">
                    ✓ {s.name_ar || s.name_fr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* الخريطة */}
          {(doctor.google_map_url || (doctor.latitude && doctor.longitude)) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-right">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                الموقع الجغرافي
              </h2>
              
              <a 
                href={doctor.google_map_url || `https://maps.google.com/maps?q=${doctor.latitude},${doctor.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-full h-[220px] rounded-2xl overflow-hidden group shadow-sm border border-gray-100 transition hover:shadow-md"
              >
                {/* Image de fond de carte statique */}
                {doctor.latitude && doctor.longitude ? (
                  <img 
                    src={`https://static-maps.yandex.ru/1.x/?ll=${doctor.longitude},${doctor.latitude}&z=15&l=map&size=650,220`}
                    alt="موقع العيادة" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">الخريطة غير متوفرة</span>
                  </div>
                )}

                {/* Overlay sombre au survol */}
                <div className="absolute inset-0 z-10 bg-slate-900/5 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-center justify-center">
                  
                  {/* Pin de carte central */}
                  <div className="relative z-20 w-12 h-12 flex items-center justify-center drop-shadow-md">
                    <svg className="w-8 h-8 text-red-500 transition-transform duration-300 group-hover:-translate-y-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {/* Effet d'onde de pulsation sous le pin */}
                    <div className="absolute w-8 h-8 rounded-full bg-red-400/30 animate-ping -z-10" />
                  </div>

                  {/* Bouton d'action au survol (version arabe avec style RTL) */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm py-2.5 px-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-all duration-300 translate-y-2 group-hover:translate-y-0" dir="rtl">
                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {displayAddress || "عرض مسار الطريق"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {doctor.wilayas?.name_ar}
                      </p>
                    </div>
                    <span className="shrink-0 bg-[#1A87D8] hover:bg-[#1571b6] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition">
                      عرض الاتجاهات
                    </span>
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
                {/* ✅ Redirige vers la recherche filtrée + flèche RTL corrigée (→ au lieu de ←) */}
                <Link href={`/recherche?specialite=${doctor.specialties?.slug}`} className="text-sm text-blue-600 hover:underline">
                  عرض الكل →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {similar.map(s => {
                  const simName = s.name_ar || s.name_fr
                  return (
                    <Link key={s.id} href={`/ar/docteur/${s.slug}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition">
                        <div style={{ backgroundColor: '#1A87D8' }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
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
                {services && services.length > 0 && ` يقدم الخدمات التالية : ${services.map(s => s.name_ar || s.name_fr).join('، ')}.`}
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
                {/* ✅ Redirige vers la recherche filtrée + flèche RTL corrigée */}
                <Link href={`/recherche?specialite=${doctor.specialties?.slug}`} className="text-blue-600 text-sm hover:underline">
                  عرض كل أطباء {doctor.specialties?.name_ar} في {doctor.wilayas?.name_ar} →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <div style={{ backgroundColor: '#1A87D8' }} className="rounded-2xl p-6 text-white sticky top-20">
            <h2 className="font-bold text-lg mb-4 text-center">احجز موعدك</h2>
            {doctor.booking_url && (
              <a 
                href={doctor.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 w-full bg-white text-blue-600 py-3 rounded-xl font-bold mb-3 hover:bg-blue-50 transition shadow-md"
              >
                <span>حجز موعد عبر الإنترنت</span>
                <span className="text-[10px] text-blue-500 font-normal">تأكيد فوري بنقرة واحدة</span>
              </a>
            )}
            {doctor.phone && (
              <a href={`tel:${doctor.phone}`}
                style={{ color: '#1E293B' }}
                className="flex items-center justify-center gap-2 w-full bg-white py-3 rounded-xl font-bold mb-3 hover:bg-blue-50 transition">
                📞 اتصل الآن
              </a>
            )}
            {doctor.phone && (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition">
                💬 واتساب
              </a>
            )}
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
              className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition group border border-transparent hover:border-blue-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇫🇷</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Voir en français</p>
                  <p className="text-xs text-gray-400">النسخة الفرنسية من هذه الصفحة</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

        {/* FOOTER */}
        <footer style={{ backgroundColor: '#0f172a' }} className="text-gray-400 py-16 border-t border-gray-800 mt-12 text-right">
          <div className="max-w-5xl mx-auto px-4">
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