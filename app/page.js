import { supabase } from '../lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Dalil Atibaa - Annuaire des Médecins en Algérie',
  description: 'Annuaire de médecins en Algérie. Trouvez un médecin par wilaya et spécialité. Adresses et téléphones.',
  alternates: {
    canonical: 'https://dalil-atibaa.vercel.app',
  },
}

async function getStats() {
  const { count: totalDoctors } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })

  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name_fr, slug')
    .order('name_fr')

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('id, name_fr, slug')
    .order('name_fr')

  return { totalDoctors, specialties, wilayas }
}

const specialtyIcons = {
  dentiste: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  cardiologue: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  ophtalmologue: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  pediatre: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  gynecologue: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  generaliste: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  default: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
}

export default async function HomePage() {
  const { totalDoctors, specialties, wilayas } = await getStats()

  const topSpecialties = specialties?.slice(0, 8) || []
  const topWilayas = ['alger', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'setif', 'tizi-ouzou', 'bejaia', 'tlemcen', 'medea', 'mostaganem']

  return (
    <main className="min-h-screen" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f8fafc' }}>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
              🇩🇿 {totalDoctors?.toLocaleString()} médecins
            </span>
            <Link href="/recherche" style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)', padding: '80px 1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
            ✓ Annuaire médical de référence en Algérie
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1', letterSpacing: '-1px' }}>
            Trouvez votre médecin<br />
            <span style={{ color: '#93c5fd' }}>en Algérie</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
            Recherchez parmi {totalDoctors?.toLocaleString()} médecins dans les 58 wilayas d'Algérie
          </p>

          <form action="/recherche" method="GET" style={{ background: 'white', borderRadius: '20px', padding: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ flex: '1', minWidth: '180px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', borderRadius: '12px', padding: '0 14px', border: '2px solid #e2e8f0' }}>
              <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="q"
                type="text"
                placeholder="Nom du médecin..."
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: '0.95rem', color: '#1e293b', outline: 'none' }}
              />
            </div>
            <div style={{ minWidth: '160px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', borderRadius: '12px', padding: '0 14px', border: '2px solid #e2e8f0' }}>
              <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <select name="specialite" style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: '0.9rem', color: '#1e293b', outline: 'none', cursor: 'pointer' }}>
                <option value="">Spécialité</option>
                {specialties?.map(s => (
                  <option key={s.id} value={s.slug}>{s.name_fr}</option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: '160px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', borderRadius: '12px', padding: '0 14px', border: '2px solid #e2e8f0' }}>
              <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <select name="wilaya" style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: '0.9rem', color: '#1e293b', outline: 'none', cursor: 'pointer' }}>
                <option value="">Wilaya</option>
                {wilayas?.map(w => (
                  <option key={w.id} value={w.slug}>{w.name_fr}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
            {['Dentiste', 'Cardiologue', 'Pédiatre', 'Gynécologue', 'Généraliste'].map(s => (
              <Link key={s} href={`/recherche?specialite=${s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}`}
                style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'all 0.2s' }}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
          {[
            { num: totalDoctors?.toLocaleString() + '+', label: 'Médecins référencés', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { num: '58', label: 'Wilayas couvertes', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
            { num: '24', label: 'Spécialités médicales', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
            { num: '100%', label: 'Accès gratuit', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e40af', lineHeight: 1 }}>{stat.num}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALITES */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              Parcourir par spécialité
            </h2>
            <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.95rem' }}>
              Trouvez rapidement un spécialiste selon votre besoin
            </p>
          </div>
          <Link href="/recherche" style={{ color: '#2563eb', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Voir tout →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '24px' }}>
          {specialties?.map(s => (
            <Link key={s.id} href={`/specialites/${s.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px 12px', textAlign: 'center', border: '2px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }}
                
                >
                <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <svg width="22" height="22" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={specialtyIcons[s.slug] || specialtyIcons.default} />
                  </svg>
                </div>
                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b', margin: 0, lineHeight: '1.3' }}>{s.name_fr}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WILAYAS POPULAIRES */}
      <section style={{ background: 'white', padding: '60px 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                Wilayas populaires
              </h2>
              <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.95rem' }}>
                Trouvez un médecin dans votre wilaya
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginTop: '24px' }}>
            {wilayas?.filter(w => topWilayas.includes(w.slug)).map(w => (
              <Link key={w.id} href={`/wilayas/${w.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '2px solid #e2e8f0', transition: 'all 0.2s' }}
                  
                  >
                  <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                    <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{w.name_fr}</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {wilayas?.filter(w => !topWilayas.includes(w.slug)).map(w => (
              <Link key={w.id} href={`/wilayas/${w.slug}`}
                style={{ fontSize: '0.8rem', color: '#475569', padding: '6px 14px', borderRadius: '20px', background: '#f1f5f9', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s' }}
                
                >
                {w.name_fr}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Comment ça marche ?
        </h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '40px', fontSize: '0.95rem' }}>
          Trouvez et contactez un médecin en 3 étapes simples
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { step: '01', title: 'Recherchez', desc: 'Entrez votre wilaya et spécialité souhaitée dans le moteur de recherche', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: '#2563eb' },
            { step: '02', title: 'Comparez', desc: 'Consultez les fiches des médecins avec avis, adresse et numéro de téléphone', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', color: '#0891b2' },
            { step: '03', title: 'Contactez', desc: 'Appelez directement le cabinet médical pour prendre votre rendez-vous', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', color: '#059669' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '2px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '3rem', fontWeight: '900', color: '#f1f5f9', lineHeight: 1 }}>{item.step}</div>
              <div style={{ width: '52px', height: '52px', background: item.color + '15', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="26" height="26" fill="none" stroke={item.color} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO CONTENT */}
      <section style={{ background: 'white', padding: '60px 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                Annuaire médical en Algérie
              </h2>
              <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '0.95rem', marginBottom: '16px' }}>
                Dalil Atibaa est le premier annuaire médical en ligne dédié à l'Algérie. Trouvez rapidement un médecin dans votre wilaya, consultez ses coordonnées, son adresse et prenez rendez-vous directement par téléphone.
              </p>
              <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '0.95rem' }}>
                Notre base de données recense plus de {totalDoctors?.toLocaleString()} médecins dans les 58 wilayas d'Algérie. Chaque fiche présente les informations essentielles pour faciliter votre recherche.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>Questions fréquentes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { q: 'Comment trouver un médecin près de chez moi ?', a: 'Utilisez notre moteur de recherche, sélectionnez votre wilaya et spécialité pour trouver les médecins disponibles.' },
                  { q: 'Dalil Atibaa est-il gratuit ?', a: 'Oui, la consultation de l\'annuaire est entièrement gratuite pour les patients.' },
                  { q: 'Quelles wilayas sont couvertes ?', a: 'Dalil Atibaa couvre les 58 wilayas d\'Algérie incluant Alger, Oran, Constantine et toutes les autres wilayas.' },
                  { q: 'Comment référencer mon cabinet ?', a: 'Contactez-nous pour référencer votre cabinet et être visible par des milliers de patients.' },
                ].map((faq, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem', marginBottom: '6px' }}>{faq.q}</p>
                    <p style={{ color: '#64748b', fontSize: '0.825rem', margin: 0, lineHeight: '1.5' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>Dalil Atibaa</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {specialties?.slice(0, 6).map(s => (
                <Link key={s.id} href={`/specialites/${s.slug}`} style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none' }}>{s.name_fr}</Link>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
            © 2025 Dalil Atibaa — Annuaire des médecins en Algérie
          </div>
        </div>
      </footer>

    </main>
  )
}