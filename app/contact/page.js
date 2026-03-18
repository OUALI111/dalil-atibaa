import Link from 'next/link'

export const metadata = {
  title: 'Contact | Dalil Atibaa',
  description: 'Contactez Dalil Atibaa pour ajouter votre cabinet, signaler une erreur ou toute question concernant notre annuaire médical en Algérie.',
  alternates: { canonical: 'https://dalil-atibaa.vercel.app/contact' },
}

export default function ContactPage() {
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
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e40af' }}>Dalil Atibaa</span>
          </Link>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Accueil</Link>
            <span>›</span>
            <span style={{ color: '#1e293b', fontWeight: '600' }}>Contact</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '60px 1rem', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', color: 'white', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Contactez-nous
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          Nous sommes à votre disposition pour toute question ou demande
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

          {/* FORM */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '36px', border: '2px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Envoyer un message
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '28px' }}>
              Réponse sous 24-48h
            </p>

            <form action="mailto:contact@dalil-atibaa.dz" method="POST" encType="text/plain" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Nom complet *
                </label>
                <input name="nom" type="text" required placeholder="Votre nom"
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Email *
                </label>
                <input name="email" type="email" required placeholder="votre@email.com"
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Sujet *
                </label>
                <select name="sujet" required
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', cursor: 'pointer' }}>
                  <option value="">Choisir un sujet</option>
                  <option value="ajouter">Ajouter mon cabinet médical</option>
                  <option value="modifier">Modifier une fiche</option>
                  <option value="supprimer">Supprimer une fiche</option>
                  <option value="erreur">Signaler une erreur</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Message *
                </label>
                <textarea name="message" required placeholder="Décrivez votre demande..." rows={5}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <button type="submit"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Envoyer le message
              </button>
            </form>
          </div>

          {/* INFOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {[
              {
                icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                title: 'Email',
                value: 'contact@dalil-atibaa.dz',
                sub: 'Réponse sous 48h',
                color: '#2563eb',
                bg: '#eff6ff',
              },
              {
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
                title: 'Ajouter votre cabinet',
                value: 'Référencement gratuit',
                sub: 'Contactez-nous pour être visible',
                color: '#059669',
                bg: '#ecfdf5',
              },
              {
                icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Signaler une erreur',
                value: 'Informations incorrectes ?',
                sub: 'Aidez-nous à améliorer notre base',
                color: '#d97706',
                bg: '#fffbeb',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '2px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: item.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" stroke={item.color} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', margin: '0 0 4px' }}>{item.title}</p>
                  <p style={{ fontWeight: '600', color: item.color, fontSize: '0.875rem', margin: '0 0 4px' }}>{item.value}</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>{item.sub}</p>
                </div>
              </div>
            ))}

            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: '20px', padding: '28px', color: 'white' }}>
              <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '12px' }}>Vous êtes médecin ?</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '16px' }}>
                Référencez votre cabinet sur Dalil Atibaa et soyez visible par des milliers de patients chaque mois. Le référencement est entièrement gratuit.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 16px', fontSize: '0.875rem', fontWeight: '600', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                ✓ Gratuit ✓ Rapide ✓ Visible sur Google
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '32px 1rem', textAlign: 'center', fontSize: '0.8rem', marginTop: '40px' }}>
        <Link href="/" style={{ color: 'white', fontWeight: '700', textDecoration: 'none' }}>Dalil Atibaa</Link>{' — '}© 2025 Annuaire des médecins en Algérie
      </footer>
    </main>
  )
}