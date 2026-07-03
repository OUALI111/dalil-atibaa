import { supabase } from '../../lib/supabase'

// ✅ Revalidation toutes les 24h au lieu de force-dynamic
// Les wilayas d'Algérie ne changent jamais → inutile de recalculer
// ce sitemap à chaque visite de Google. 1 fois par jour suffit largement.
export const revalidate = 86400

// ✅ Date fixe et stable : Google ne pense plus que les pages wilayas
// changent à chaque seconde → économie du budget de crawl
const LAST_MODIFIED = '2026-06-01T00:00:00.000Z'

export async function GET() {
  const baseUrl = 'https://www.dalil-atibaa.com'

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('slug')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${wilayas?.map(w => `
  <url>
    <loc>${baseUrl}/wilayas/${w.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <lastmod>${LAST_MODIFIED}</lastmod>
  </url>`).join('') || ''}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    }
  })
}