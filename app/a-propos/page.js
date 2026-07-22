import Link from 'next/link'

export const metadata = {
  title: 'A propos | Dalil Atibaa',
  description: 'Dalil Atibaa est le premier annuaire médical en ligne dédié à l\'Algérie. Découvrez notre mission et notre équipe.',
  alternates: { canonical: 'https://www.dalil-atibaa.com/a-propos' },
}

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* HERO */}
      <div style={{ background: '#1A87D8', padding: '30px 1rem 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Logo en haut à gauche */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img 
              src="/logo.svg" 
              alt="Dalil Atibaa" 
              width="200" 
              height="44" 
              style={{ 
                height: '36px', 
                width: 'auto', 
                filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.95))' 
              }} 
            />
          </Link>
          <Link 
            href="/recherche" 
            style={{ 
              background: 'white', 
              color: '#1A87D8', 
              textDecoration: 'none', 
              padding: '10px 18px', 
              borderRadius: '12px', 
              fontSize: '0.875rem', 
              fontWeight: '700', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            Trouver un médecin
          </Link>
        </div>

        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(255,255,255,0.2)' }}>
            <svg width="36" height="36" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', color: 'white', margin: '0 0 16px', letterSpacing: '-1px' }}>
            A propos de Dalil Atibaa
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Le premier annuaire médical en ligne dédié à l'Algérie
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 1rem' }}>

        {/* MISSION */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', border: '2px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: '#e8f4fc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="#1A87D8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Notre mission</h2>
          </div>
          <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem', marginBottom: '16px' }}>
            Dalil Atibaa a été créé avec une mission simple : faciliter l'accès aux soins médicaux en Algérie en connectant les patients avec les médecins de leur région.
          </p>
          <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem' }}>
            Nous croyons que chaque algérien devrait pouvoir trouver rapidement un médecin qualifié près de chez lui, sans complications. Notre plateforme gratuite permet de rechercher par wilaya et spécialité, d'accéder aux coordonnées directement et de contacter le cabinet en un clic.
          </p>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { num: '1000+', label: 'Médecins référencés', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: '#1A87D8', bg: '#e8f4fc' },
            { num: '58', label: 'Wilayas couvertes', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', color: '#059669', bg: '#ecfdf5' },
            { num: '24', label: 'Spécialités médicales', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: '#7c3aed', bg: '#f5f3ff' },
            { num: '100%', label: 'Gratuit pour les patients', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#d97706', bg: '#fffbeb' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '28px 20px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', background: stat.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="26" height="26" fill="none" stroke={stat.color} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1, marginBottom: '6px' }}>{stat.num}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* VALEURS */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', border: '2px solid #e2e8f0', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '28px' }}>Nos valeurs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Fiabilité', desc: 'Informations vérifiées et régulièrement mises à jour pour garantir l\'exactitude des données.', color: '#1A87D8', bg: '#e8f4fc' },
              { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064', title: 'Accessibilité', desc: 'Un service gratuit et accessible à tous les Algériens, sans inscription requise.', color: '#059669', bg: '#ecfdf5' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Simplicité', desc: 'Interface intuitive pour trouver rapidement un médecin sans perte de temps.', color: '#d97706', bg: '#fffbeb' },
              { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', title: 'Proximité', desc: 'Présent dans les 58 wilayas pour connecter les patients avec les médecins locaux.', color: '#7c3aed', bg: '#f5f3ff' },
            ].map((val, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '44px', height: '44px', background: val.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" fill="none" stroke={val.color} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={val.icon} />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', margin: '0 0 6px' }}>{val.title}</p>
                  <p style={{ color: '#64748b', fontSize: '0.825rem', lineHeight: '1.6', margin: 0 }}>{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMENT CA MARCHE */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', border: '2px solid #e2e8f0', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '28px' }}>Comment fonctionne Dalil Atibaa ?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { step: '01', title: 'Base de données médicale', desc: 'Nous collectons et vérifions les informations des médecins à travers toute l\'Algérie: nom, spécialité, adresse, téléphone et localisation GPS.', color: '#1A87D8' },
              { step: '02', title: 'Moteur de recherche', desc: 'Notre moteur de recherche permet de filtrer par wilaya, spécialité ou nom du médecin pour trouver exactement ce que vous cherchez.', color: '#059669' },
              { step: '03', title: 'Contact direct', desc: 'Les coordonnées du médecin sont affichées directement sur sa fiche. Appelez ou envoyez un message WhatsApp en un seul clic.', color: '#7c3aed' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: item.color, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1rem', flexShrink: 0 }}>
                  {item.step}
                </div>
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem', margin: '0 0 6px' }}>{item.title}</p>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#1A87D8', borderRadius: '24px', padding: '40px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 12px' }}>Vous êtes médecin ?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Rejoignez Dalil Atibaa gratuitement et soyez visible par des milliers de patients chaque mois en Algérie.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact"
              style={{ background: 'white', color: '#1E293B', padding: '12px 28px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>
              Référencer mon cabinet
            </Link>
            <Link href="/recherche"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '12px 28px', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              Voir l'annuaire
            </Link>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a' }} className="text-gray-400 py-16 border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
            
            {/* Colonne 1: À Propos */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <img 
                  src="/logo.svg" 
                  alt="Dalil Atibaa" 
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
                Le premier annuaire médical en Algérie. Trouvez un professionnel de santé proche de chez vous et facilitez vos démarches de soin au quotidien.
              </p>
            </div>

            {/* Colonne 2: Liens Utiles */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Liens Utiles</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white transition">Accueil</Link></li>
                <li><Link href="/recherche" className="hover:text-white transition">Recherche avancée</Link></li>
                <li><Link href="/conseils" className="hover:text-white transition">Conseils Médicaux</Link></li>
                <li><Link href="/a-propos" className="hover:text-white transition">À propos de nous</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Nous contacter</Link></li>
              </ul>
            </div>

            {/* Colonne 3: Spécialités populaires */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Spécialités Populaires</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/specialites/dentiste" className="hover:text-white transition">Dentiste en Algérie</Link></li>
                <li><Link href="/specialites/gynecologue" className="hover:text-white transition">Gynécologue en Algérie</Link></li>
                <li><Link href="/specialites/cardiologue" className="hover:text-white transition">Cardiologue en Algérie</Link></li>
                <li><Link href="/specialites/pediatre" className="hover:text-white transition">Pédiatre en Algérie</Link></li>
                <li><Link href="/specialites/ophtalmologue" className="hover:text-white transition">Ophtalmologue en Algérie</Link></li>
              </ul>
            </div>

            {/* Colonne 4: B2B Cabinet */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Vous êtes médecin ?</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Rejoignez Dalil Atibaa pour augmenter la visibilité de votre cabinet et simplifier l'accès aux soins de vos patients.
              </p>
              <Link 
                href="/contact" 
                className="inline-block bg-[#1A87D8] hover:bg-[#1571b6] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                Inscrire mon cabinet
              </Link>
            </div>

          </div>

          {/* Sub-footer */}
          <div className="border-t border-slate-800 mt-12 pt-10 flex flex-col items-center gap-6 text-center text-xs text-gray-300">
            <div className="space-y-3">
              <p className="font-medium">© 2026 Dalil Atibaa — Annuaire des médecins en Algérie. Tous droits réservés.</p>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Dalil Atibaa n'est pas un service d'urgence. En cas d'urgence médicale, contactez le 14 ou le 115.
              </p>
            </div>
            <div className="flex justify-center gap-4 text-gray-400 pt-2">
              <Link href="/a-propos" className="hover:text-white transition">Mentions légales</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}