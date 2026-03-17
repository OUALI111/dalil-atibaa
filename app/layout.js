import './globals.css'

export const metadata = {
  metadataBase: new URL('https://dalil-atibaa.vercel.app'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}