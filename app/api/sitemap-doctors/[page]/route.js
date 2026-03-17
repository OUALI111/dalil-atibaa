import { supabase } from '../../../../lib/supabase'

const PAGE_SIZE = 50000

export async function GET(request, context) {
  const baseUrl = 'https://dalil-atibaa.vercel.app'
  const params = await context.params
  const page = parseInt(params.page) - 1
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: doctors } = await supabase
    .from('doctors')
    .select('slug, updated_at')
    .eq('is_active', true)
    .range(from, to)

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
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    }
  })
}
