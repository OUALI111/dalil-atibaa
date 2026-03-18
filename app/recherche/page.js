import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const specialite = params?.specialite || ''
  const wilaya = params?.wilaya || ''
  const q = params?.q || ''

  const paramsList = []
  if (specialite) paramsList.push(`specialite=${specialite}`)
  if (wilaya) paramsList.push(`wilaya=${wilaya}`)

  const canonicalUrl = paramsList.length
    ? `https://dalil-atibaa.vercel.app/recherche?${paramsList.join('&')}`
    : 'https://dalil-atibaa.vercel.app/recherche'

  const title = specialite && wilaya
    ? `${specialite} a ${wilaya} | Dalil Atibaa`
    : specialite
    ? `${specialite} en Algerie | Dalil Atibaa`
    : wilaya
    ? `Medecins a ${wilaya} | Dalil Atibaa`
    : 'Recherche medecins en Algerie | Dalil Atibaa'

  const description = specialite && wilaya
    ? `${specialite} a ${wilaya}. Adresses et telephones disponibles sur Dalil Atibaa.`
    : specialite
    ? `Tous les ${specialite} en Algerie. Coordonnees et avis patients sur Dalil Atibaa.`
    : wilaya
    ? `Medecins a ${wilaya}. Filtrez par specialite et prenez rendez-vous facilement.`
    : 'Annuaire medical Algerie. Trouvez un medecin par wilaya et specialite. Plus de 1000 medecins.'

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
  }
}

async function getDoctorsWithCache({ q, specialite, wilaya, page = 0 }) {
  const cacheKey = `search-${q}-${specialite}-${wilaya}-${page}`
  const { unstable_cache } = await import('next/cache')

  const cachedFn = unstable_cache(
    async () => {
      const pageSize = 24
      const from = page * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('doctors')
        .select(`id, name_fr, slug, address, phone, rating, specialties(name_fr, slug), wilayas(name_fr, slug)`, { count: 'exact' })
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .range(from, to)

      if (q) query = query.textSearch('search_vector', q, { type: 'websearch', config: 'french' })

      if (specialite) {
        const { data: spec } = await supabase.from('specialties').select('id').eq('slug', specialite).single()
        if (spec) query = query.eq('specialty_id', spec.id)
      }

      if (wilaya) {
        const { data: wil } = await supabase.from('wilayas').select('id').eq('slug', wilaya).single()
        if (wil) query = query.eq('wilaya_id', wil.id)
      }

      const { data, count } = await query
      return { doctors: data || [], total: count || 0, pageSize }
    },
    [cacheKey],
    { revalidate: 3600, tags: ['doctors', cacheKey] }
  )

  return cachedFn()
}

const getFilters = async () => {
  const { unstable_cache } = await import('next/cache')
  const fn = unstable_cache(async () => {
    const { data: specialties } = await supabase.from('specialties').select('id, name_fr, slug').order('name_fr')
    const { data: wilayas } = await supabase.from('wilayas').select('id, name_fr, slug').order('name_fr')
    return { specialties, wilayas }
  }, ['filters'], { revalidate: 86400, tags: ['filters'] })
  return fn()
}

function StarRating({ rating }) {
  const stars = Math.round(rating || 0)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" fill={i <= stars ? '#f59e0b' : '#e2e8f0'} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '4px' }}>{rating || 0}</span>
    </div>
  )
}

export default async function RecherchePage({ searchParams }) {
  const params = await searchParams
  const q = params?.q || ''
  const specialite = params?.specialite || ''
  const wilaya = params?.wilaya || ''
  const page = parseInt(params?.page || '0')

  const [{ doctors, total, pageSize }, { specialties, wilayas }] = await Promise.all([
    getDoctorsWithCache({ q, specialite, wilaya, page }),
    getFilters()
  ])

  const totalPages = Math.ceil(total / pageSize)
  const from = page * pageSize
  const to = Math.min(from + pageSize, total)

  const buildUrl = (p) => {
    const parts = []
    if (q) parts.push(`q=${q}`)
    if (specialite) parts.push(`specialite=${specialite}`)
    if (wilaya) parts.push(`wilaya=${wilaya}`)
    parts.push(`page=${p}`)
    return `/recherche?${parts.join('&')}`
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e40af', letterSpacing: '-0.5px' }}>Dalil Atibaa</span>
          </Link>
          <Link href="/" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Accueil
          </Link>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '24px 1rem' }}>
        <form action="/recherche" method="GET"
          style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', alignItems: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', borderRadius: '10px', padding: '0 12px', border: '2px solid #e2e8f0' }}>
            <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input name="q" defaultValue={q} placeholder="Nom du médecin..."
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '0.875rem', outline: 'none', color: '#1e293b' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', borderRadius: '10px', padding: '0 12px', border: '2px solid #e2e8f0' }}>
            <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <select name="specialite" defaultValue={specialite}
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '0.875rem', outline: 'none', color: '#1e293b', cursor: 'pointer' }}>
              <option value="">Spécialité</option>
              {specialties?.map(s => <option key={s.id} value={s.slug}>{s.name_fr}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', borderRadius: '10px', padding: '0 12px', border: '2px solid #e2e8f0' }}>
            <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <select name="wilaya" defaultValue={wilaya}
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '0.875rem', outline: 'none', color: '#1e293b', cursor: 'pointer' }}>
              <option value="">Wilaya</option>
              {wilayas?.map(w => <option key={w.id} value={w.slug}>{w.name_fr}</option>)}
            </select>
          </div>
          <button type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '12px 20px', borderRadius: '10px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rechercher
          </button>
        </form>
      </div>

      {/* RESULTS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 1rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              {specialite && wilaya ? `${specialite} à ${wilaya}`
                : specialite ? `${specialite} en Algérie`
                : wilaya ? `Médecins à ${wilaya}`
                : 'Recherche de médecins'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
              {total} médecin(s) trouvé(s)
              {total > 0 && ` — ${from + 1}-${to} affichés`}
            </p>
          </div>
        </div>

        {doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '16px' }}>Aucun médecin trouvé</p>
            <Link href="/recherche" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Effacer les filtres</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {doctors.map(d => (
                <Link key={d.id} href={`/docteur/${d.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '2px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.25rem', flexShrink: 0 }}>
                        {d.name_fr?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name_fr}</h2>
                        <p style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', margin: 0 }}>{d.specialties?.name_fr}</p>
                        <div style={{ marginTop: '6px' }}><StarRating rating={d.rating} /></div>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {d.wilayas && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem' }}>
                          <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {d.wilayas.name_fr}
                        </div>
                      )}
                      {d.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.8rem', fontWeight: '600' }}>
                          <svg width="14" height="14" fill="none" stroke="#059669" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {d.phone}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '12px', background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
                      Voir le profil →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
                {page > 0 && (
                  <a href={buildUrl(page - 1)} style={{ padding: '10px 16px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>← Précédent</a>
                )}
                {Array.from({ length: totalPages }, (_, i) => {
                  if (i === 0 || i === totalPages - 1 || (i >= page - 2 && i <= page + 2)) {
                    return (
                      <a key={i} href={buildUrl(i)} style={{ padding: '10px 16px', background: i === page ? '#2563eb' : 'white', border: `2px solid ${i === page ? '#2563eb' : '#e2e8f0'}`, borderRadius: '10px', color: i === page ? 'white' : '#475569', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
                        {i + 1}
                      </a>
                    )
                  }
                  if (i === page - 3 || i === page + 3) return <span key={i} style={{ padding: '10px 4px', color: '#94a3b8' }}>...</span>
                  return null
                })}
                {page < totalPages - 1 && (
                  <a href={buildUrl(page + 1)} style={{ padding: '10px 16px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>Suivant →</a>
                )}
              </div>
            )}
            {total > 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '12px' }}>{from + 1}-{to} sur {total} médecins</p>}
          </>
        )}

        {/* SEO */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', marginTop: '40px', border: '2px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
            {specialite && wilaya ? `Trouver un ${specialite} à ${wilaya}` : specialite ? `${specialite} en Algérie` : wilaya ? `Médecins à ${wilaya}` : 'Trouver un médecin en Algérie'}
          </h2>
          <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '0.9rem', marginBottom: '20px' }}>
            {specialite && wilaya ? `Consultez la liste complète des ${specialite} à ${wilaya}. Adresses et téléphones disponibles.` : `Dalil Atibaa recense plus de 1000 médecins dans les 58 wilayas d'Algérie.`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { q: 'Comment trouver un médecin ?', a: 'Utilisez les filtres wilaya et spécialité. Les résultats sont triés par note.' },
              { q: 'Comment prendre rendez-vous ?', a: 'Cliquez sur la fiche du médecin pour voir son numéro de téléphone.' },
              { q: 'Les informations sont-elles à jour ?', a: 'Nous mettons régulièrement à jour notre base de données.' },
              { q: 'Puis-je ajouter mon cabinet ?', a: 'Oui, contactez-nous pour référencer votre cabinet sur Dalil Atibaa.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.8rem', marginBottom: '6px' }}>{faq.q}</p>
                <p style={{ color: '#64748b', fontSize: '0.775rem', margin: 0, lineHeight: '1.5' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '32px 1rem', textAlign: 'center', fontSize: '0.8rem', marginTop: '40px' }}>
        <Link href="/" style={{ color: 'white', fontWeight: '700', textDecoration: 'none' }}>Dalil Atibaa</Link>
        {' — '}© 2025 Annuaire des médecins en Algérie
      </footer>

    </main>
  )
}