import './globals.css'

export const metadata = {
  metadiconsataBase: new URL('https://www.dalil-atibaa.com'),
  title: 'Dalil Atibaa | Trouvez un Médecin en Algérie',
  description: 'Annuaire médical de référence en Algérie. Trouvez un médecin par spécialité et par wilaya.',
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

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}