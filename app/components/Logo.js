import Image from 'next/image'
import Link from 'next/link'

/**
 * ✅ Bug #19 fix : Composant Logo partagé utilisant <Image> Next.js
 * 
 * Avantages vs <img> brut :
 * - Lazy loading automatique (sauf si priority=true)
 * - Dimensions réservées → pas de Layout Shift (CLS)
 * - Compatible avec next/image optimization pipeline
 * - Unique source de vérité pour le logo sur tout le site
 *
 * Usage dans un header :
 *   <Logo priority />          ← header (above the fold, chargement prioritaire)
 *   <Logo />                   ← footer (lazy loading)
 *   <Logo dark />              ← variante sombre (filtre CSS)
 */
export default function Logo({ priority = false, dark = false, className = '' }) {
  const filterStyle = dark
    ? {} // Logo visible sur fond clair
    : { filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.95))' } // Logo sur fond bleu

  return (
    <Link href="/" aria-label="Dalil Atibaa — Accueil">
      <Image
        src="/logo.svg"
        alt="Dalil Atibaa"
        width={200}
        height={44}
        priority={priority}
        style={{
          height: '36px',
          width: 'auto',
          ...filterStyle,
        }}
        className={className}
      />
    </Link>
  )
}
