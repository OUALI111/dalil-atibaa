import { supabase } from '../lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://www.dalil-atibaa.com'
  const BATCH = 1000

  const allDoctors = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('doctors')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .neq('slug', '')
      .order('id', { ascending: true })
      .range(from, from + BATCH - 1)

    if (error || !data || data.length === 0) {
      hasMore = false
      break
    }

    allDoctors.push(...data)

    if (data.length < BATCH) {
      hasMore = false
    } else {
      from += BATCH
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allDoctors.map(d => `  <url>
    <loc>${baseUrl}/ar/docteur/${d.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${d.updated_at ? new Date(d.updated_at).toISOString() : new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    }
  })
}