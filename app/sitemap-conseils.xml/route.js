import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://www.dalil-atibaa.com'

  const { data: conseils } = await supabase
    .from('conseils')
    .select('slug, lang, created_at')
    .eq('is_active', true)
    .order('id', { ascending: false })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${conseils?.map(c => `
  <url>
    <loc>${baseUrl}/${c.lang === 'ar' ? 'ar/' : ''}conseils/${c.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${c.created_at || new Date().toISOString()}</lastmod>
  </url>`).join('') || ''}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}