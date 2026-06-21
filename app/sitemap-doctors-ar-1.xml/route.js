import { supabase } from '../lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://www.dalil-atibaa.com'
  const pageSize = 50000

  const { data: doctors } = await supabase
    .from('doctors')
    .select('slug, created_at')
    .eq('is_active', true)
    .order('id')
    .range(0, pageSize - 1)

  const urls = doctors?.map(d => `
  <url>
    <loc>${baseUrl}/ar/docteur/${d.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('') || ''

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    }
  })
}