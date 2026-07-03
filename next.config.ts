import type { NextConfig } from "next";
const redirectsList = require('./redirects.config.js')

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
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