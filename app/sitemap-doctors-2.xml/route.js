import { supabase } from '../../lib/supabase'

export async function GET() {
  const baseUrl = 'https://dalil-atibaa.vercel.app'

  const { data: doctors } = await supabase
    .from('doctors')
    .select('slug, updated_at')
    .eq('is_active', true)
    .range(0, 1999)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${doctors?.map(d => `
  <url>
    <loc>${baseUrl}/docteur/${d.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${d.updated_at || new Date().toISOString()}</lastmod>
  </url>`).join('') || ''}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}