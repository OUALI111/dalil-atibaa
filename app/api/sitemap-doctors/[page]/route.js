import { supabase } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50000

export async function GET(request, context) {
  const baseUrl = 'https://www.dalil-atibaa.com'
  const params = await context.params
  const page = parseInt(params.page) - 1
  const globalFrom = page * PAGE_SIZE
  const globalTo = globalFrom + PAGE_SIZE - 1

  // ─── Batching par 1000 (limite Supabase) ──────────────────────
  const allDoctors = []
  const BATCH = 1000
  let batchFrom = globalFrom
  let hasMore = true

  while (hasMore) {
    const batchTo = Math.min(batchFrom + BATCH - 1, globalTo)

    const { data, error } = await supabase
      .from('doctors')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .neq('slug', '')
      .order('id', { ascending: true })
      .range(batchFrom, batchTo)

    if (error || !data || data.length === 0) {
      hasMore = false
      break
    }

    allDoctors.push(...data)

    if (data.length < BATCH || batchFrom + BATCH > globalTo) {
      hasMore = false
    } else {
      batchFrom += BATCH
    }
  }

  // ─── Générer le XML ────────────────────────────────────────────
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allDoctors.map(d => `  <url>
    <loc>${baseUrl}/docteur/${d.slug}</loc>
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