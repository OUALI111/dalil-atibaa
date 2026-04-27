export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://www.dalil-atibaa.com'

  const urls = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/recherche`, priority: '0.9', changefreq: 'daily' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}