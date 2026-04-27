import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://www.dalil-atibaa.com'

  const { data: specialties } = await supabase
    .from('specialties')
    .select('slug')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${specialties?.map(s => `
  <url>
    <loc>${baseUrl}/specialites/${s.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('') || ''}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}