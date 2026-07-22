/**
 * ✅ Bug #26 fix : Composant SiteHeader partagé
 *
 * Avant : header copié-collé dans chaque page (conseils, ar/conseils, recherche, etc.)
 * Après : source unique ici.
 *
 * Usage :
 *   <SiteHeader />                        ← header FR avec bouton "Trouver un médecin"
 *   <SiteHeader lang="ar" />              ← header AR avec bouton en arabe
 *   <SiteHeader lang="ar" currentPath="/ar/conseils" />  ← pour le bouton langue
 */
import Link from 'next/link'
import Logo from './Logo'

export default function SiteHeader({ lang = 'fr', currentPath = '' }) {
  const isAr = lang === 'ar'

  // Chemin vers la version dans l'autre langue
  const altLangHref = isAr
    ? currentPath.replace(/^\/ar/, '') || '/'
    : `/ar${currentPath}`

  return (
    <header
      style={{ backgroundColor: '#1A87D8' }}
      className="sticky top-0 z-50 py-4 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">

        {/* Logo */}
        <Logo priority />

        <div className="flex items-center gap-3">

          {/* Bouton CTA principal */}
          <Link
            href="/recherche"
            className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow-sm"
          >
            {isAr ? 'ابحث عن طبيب' : 'Trouver un médecin'}
          </Link>

          {/* Bouton changement de langue */}
          {currentPath && (
            <Link
              href={altLangHref}
              className="text-white hover:text-blue-100 text-sm font-semibold transition flex items-center gap-1.5 border border-white/30 px-3 py-1.5 rounded-lg hover:border-white/60"
              aria-label={isAr ? 'Passer en français' : 'الانتقال إلى العربية'}
            >
              {isAr ? '🇫🇷 FR' : '🇩🇿 AR'}
            </Link>
          )}

        </div>
      </div>
    </header>
  )
}
