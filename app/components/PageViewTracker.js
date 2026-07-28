'use client'
// ─────────────────────────────────────────────────────────────────────────────
// PageViewTracker.js
// Écoute les changements de route Next.js (App Router) et envoie un event
// page_view à GA4 à chaque navigation SPA.
//
// Pourquoi c'est nécessaire :
//   Next.js utilise la navigation côté client (pas de rechargement de page).
//   Sans ce composant, GA4 ne voit qu'une seule page_view par session
//   (la première page chargée), même si l'utilisateur visite 10 fiches.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function PageViewTracker() {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')

    window.gtag('event', 'page_view', {
      page_path:     url,
      page_title:    document.title,
      page_location: window.location.href,
    })
  }, [pathname, searchParams])

  return null
}
