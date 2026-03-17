import { supabase } from '../../lib/supabase'

export async function GET() {
  const baseUrl = 'https://dalil-atibaa.vercel.app'

  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('slug')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${wilayas?.map(w => `
  <url>
    <loc>${baseUrl}/wilayas/${w.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('') || ''}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}