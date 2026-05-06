import { supabase } from '../../lib/supabase'
export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://www.dalil-atibaa.com'

  const { data: pages } = await supabase
    .from('meilleurs_pages')
    .select('specialty_slug, wilaya_slug, updated_at')
    .eq('is_active', true)
    .order('id')

  const urls = pages?.map(p => `
  <url>
    <loc>${baseUrl}/meilleurs/${p.specialty_slug}-${p.wilaya_slug}</loc>
    <lastmod>${p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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