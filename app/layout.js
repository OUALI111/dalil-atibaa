import { headers } from 'next/headers'
import './globals.css'

export const metadata = {
  metadataBase: new URL('https://www.dalil-atibaa.com'),
  title: 'Dalil Atibaa | Trouvez un Médecin en Algérie',
  description: 'Annuaire médical de référence en Algérie. Trouvez un médecin par spécialité et par wilaya.',
  // ✅ Ajout openGraph.locale pour indiquer à Google/Facebook la région correcte
  openGraph: {
    locale: 'fr_DZ',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-32x32.png',
  },
  verification: {
    google: 'D547io5wtOUcjrJPy8ssvzkAUg0RTYeibFx7jfKc03w',
  },
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3DJLB4FLQC"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3DJLB4FLQC');
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}