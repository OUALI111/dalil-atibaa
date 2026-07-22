import type { NextConfig } from "next";
const redirectsList = require('./redirects.config.js')

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // ✅ Bug #27 fixé : 60s était trop court pour des images statiques (logo, avatars)
    // 86400s = 24h : les images ne changent pas en cours de journée
    minimumCacheTTL: 86400,
    // ✅ Bug #19 : permet à <Image> de Next.js de gérer les SVG
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/(.*)\\.(js|css|woff|woff2|ttf|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // ✅ PWA Étape 4 — Service Worker headers
        // Service-Worker-Allowed: / → autorise le SW à contrôler tout le site depuis /public/sw.js
        // Cache-Control: no-cache → le navigateur vérifie toujours s'il y a une nouvelle version du SW
        source: '/sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        // ✅ Rewrite transparent (invisible pour Google) :
        // Google visite  /sitemap-doctors-1.xml  → reçoit le contenu de /api/sitemap-doctors/1
        // Code HTTP : 200 OK direct (au lieu de 302 → suivi → 200 avant)
        // Avantage SEO : Google lit le sitemap en 1 seul appel, sans aller-retour inutile
        source: '/sitemap-doctors-:page.xml',
        destination: '/api/sitemap-doctors/:page',
      },
    ]
  },
  async redirects() {
    return redirectsList
  },

}

export default nextConfig;