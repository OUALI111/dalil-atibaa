import './globals.css'

export const metadata = {
  metadataBase: new URL('https://www.dalil-atibaa.com'),
  title: 'Dalil Atibaa | Trouvez un Médecin en Algérie',
  description: 'Annuaire médical de référence en Algérie. Trouvez un médecin par spécialité et par wilaya.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: 'D547io5wtOUcjrJPy8ssvzkAUg0RTYeibFx7jfKc03w',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}