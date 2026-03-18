import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: wilaya } = await supabase.from('wilayas').select('name_fr').eq('slug', slug).single()
  if (!wilaya) return { title: 'Wilaya introuvable' }
  return {
    title: `Medecins a ${wilaya.name_fr} | Dalil Atibaa`,
    description: `Trouvez un medecin a ${wilaya.name_fr}. Liste complete avec adresses, telephones et specialites.`,
    alternates: { canonical: `https://dalil-atibaa.vercel.app/wilayas/${slug}` },
  }
}

export default async function WilayaPage({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams
  const currentPage = parseInt(sp?.page ?? '0')
  const pageSize = 24
  const from = currentPage * pageSize
  const to = from + pageSize - 1

  const { data: wilaya } = await supabase.from('wilayas').select('*').eq('slug', slug).single()
  if (!wilaya) notFound()

  const { data: doctors, count: totalDoctors } = await supabase
    .from('doctors')
    .select(`id, name_fr, slug, address, phone, rating, specialties(name_fr, slug)`, { count: 'exact' })
    .eq('wilaya_id', wilaya.id)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .range(from, to)

  const { data: specialties } = await supabase.from('specialties').select('name_fr, slug').order('name_fr')

  const total = totalDoctors || 0
  const totalPages = Math.ceil(total / pageSize)
  const buildUrl = (p) => `/wilayas/${slug}?page=${p}`

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e40af' }}>Dalil Atibaa</span>
          </Link>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Accueil</Link>
            <span>›</span>
            <span style={{ color: '#1e293b', fontWeight: '600' }}>{wilaya.name_fr}</span>
          </div>
        </div>
      </header>

      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '40px 1rem 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '900', color: 'white', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Médecins à {wilaya.name_fr}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 24px', fontSize: '0.95rem' }}>
            {total} médecin(s) référencé(s) {totalPages > 1 && `— Page ${currentPage + 1}/${totalPages}`}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Link href={`/wilayas/${slug}`} style={{ background: 'white', color: '#2563eb', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>
              Tous
            </Link>
            {specialties?.map(s => (
              <Link key={s.slug} href={`/wilayas/${slug}/${s.slug}`}
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
                {s.name_fr}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 1rem' }}>
        {!doctors || doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Aucun médecin trouvé</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {doctors.map(doctor => (
                <Link key={doctor.id} href={`/docteur/${doctor.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '2px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.25rem', flexShrink: 0 }}>
                        {doctor.name_fr?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doctor.name_fr}</h2>
                        <p style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', margin: '0 0 6px' }}>{doctor.specialties?.name_fr}</p>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(i => (
                            <svg key={i} width="13" height="13" fill={i <= Math.round(doctor.rating || 0) ? '#f59e0b' : '#e2e8f0'} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '4px' }}>{doctor.rating}</span>
                        </div>
                      </div>
                    </div>
                    {doctor.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px' }}>
                        <svg width="14" height="14" fill="none" stroke="#059669" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {doctor.phone}
                      </div>
                    )}
                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
                      Voir le profil →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
                {currentPage > 0 && <a href={buildUrl(currentPage - 1)} style={{ padding: '10px 16px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>← Précédent</a>}
                {Array.from({ length: totalPages }, (_, i) => {
                  if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    return <a key={i} href={buildUrl(i)} style={{ padding: '10px 16px', background: i === currentPage ? '#2563eb' : 'white', border: `2px solid ${i === currentPage ? '#2563eb' : '#e2e8f0'}`, borderRadius: '10px', color: i === currentPage ? 'white' : '#475569', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>{i + 1}</a>
                  }
                  if (i === currentPage - 3 || i === currentPage + 3) return <span key={i} style={{ padding: '10px 4px', color: '#94a3b8' }}>...</span>
                  return null
                })}
                {currentPage < totalPages - 1 && <a href={buildUrl(currentPage + 1)} style={{ padding: '10px 16px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>Suivant →</a>}
              </div>
            )}
            {total > 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '12px' }}>{from + 1}-{Math.min(to + 1, total)} sur {total} médecins</p>}
          </>
        )}

        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', marginTop: '40px', border: '2px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Trouver un médecin à {wilaya.name_fr}</h2>
          <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '0.9rem' }}>
            Dalil Atibaa vous aide à trouver rapidement un médecin à {wilaya.name_fr}. Notre annuaire recense les médecins généralistes, dentistes, cardiologues et bien d'autres spécialistes.
          </p>
        </div>
      </div>

      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '32px 1rem', textAlign: 'center', fontSize: '0.8rem', marginTop: '40px' }}>
        <Link href="/" style={{ color: 'white', fontWeight: '700', textDecoration: 'none' }}>Dalil Atibaa</Link>{' — '}© 2025 Annuaire des médecins en Algérie
      </footer>
    </main>
  )
}