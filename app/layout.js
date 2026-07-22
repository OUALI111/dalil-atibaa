import { headers } from 'next/headers'
import Script from 'next/script'
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration'
import InstallBanner from './components/InstallBanner'
import './globals.css'

export const metadata = {
  metadataBase: new URL('https://www.dalil-atibaa.com'),
  title: 'Dalil Atibaa | Trouvez un Médecin en Algérie',
  description: 'Annuaire médical de référence en Algérie. Trouvez un médecin par spécialité et par wilaya.',

  // ✅ PWA Étape 3 : manifest
  manifest: '/manifest.json',

  // ✅ Méta iOS Apple (PWA sur Safari/iPhone)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dalil Atibaa',
  },

  // ✅ Ajout openGraph.locale pour indiquer à Google/Facebook la région correcte
  openGraph: {
    locale: 'fr_DZ',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    // ✅ apple-touch-icon mis à jour avec la nouvelle icône PWA
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
  },
  verification: {
    google: 'D547io5wtOUcjrJPy8ssvzkAUg0RTYeibFx7jfKc03w',
  },
}

// ✅ Next.js 16 : themeColor et viewport dans generateViewport (séparé de metadata)
export function generateViewport() {
  return {
    themeColor: '#1A87D8',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  }
}

// ✅ async : nécessaire pour lire les headers HTTP injectés par middleware.js
export default async function RootLayout({ children }) {
  // Lit le header x-pathname injecté par middleware.js
  // Exemple : "/ar/docteur/halim-vet-6615" → isArabic = true
  //           "/docteur/dermatologue-bejaia" → isArabic = false
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isArabic = pathname.startsWith('/ar')

  return (
    // ✅ lang et dir sont maintenant dynamiques selon la langue de la page
    // Pages arabes  : <html lang="ar" dir="rtl">
    // Pages françaises : <html lang="fr" dir="ltr">
    <html lang={isArabic ? 'ar' : 'fr'} dir={isArabic ? 'rtl' : 'ltr'}>
      <head>
        {/* ✅ Audit P3 — preconnect : réduit la latence des premières connexions
            Supabase : -150-300ms sur TTFB première visite
            Google Tag Manager : chargé afterInteractive mais la connexion
            DNS+TCP+TLS est pré-établie à l'avance */}
        <link rel="preconnect" href="https://mpovugxbveqavhbjsttx.supabase.co" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://mpovugxbveqavhbjsttx.supabase.co" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body>
        {/* ✅ PWA Étape 4 — Enregistrement du service worker (production uniquement) */}
        <ServiceWorkerRegistration />
        {/* ✅ PWA Étape 5 — Banner d'installation (Android + iOS) */}
        <InstallBanner />
        {children}
        {/* ✅ Bug #25 fix : ID GA via variable d'environnement
            - Changer d'ID sans toucher au code : modifier .env.local + redéployer
            - Guard : pas de script injecté si NEXT_PUBLIC_GA_ID non défini (env de test)
            ✅ GA chargé APRÈS la page → ne bloque plus le rendu (économie ~140ms sur LCP) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}