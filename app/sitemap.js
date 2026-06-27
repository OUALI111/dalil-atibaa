import { supabase } from '../lib/supabase'

// ✅ Cache 24h au lieu de force-dynamic
// Le sitemap ne change pas plusieurs fois par jour.
// Google le crawle rarement → inutile de le recalculer à chaque visite.
// Avant : force-dynamic = 1 requête SQL à chaque fois que Google visite /sitemap.xml
// Après : 1 requête SQL toutes les 24h maximum
export const revalidate = 86400

export default async function sitemap() {
  const baseUrl = 'https://www.dalil-atibaa.com'
  const pageSize = 50000

  const { count } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const totalDoctors = count || 0
  const totalPages = Math.ceil(totalDoctors / pageSize)

  // ✅ Date fixe = Google sait que le sitemap est stable (ne change pas à chaque crawl)
  // Une date changeante à chaque génération peut tromper Google et gaspiller le crawl budget
  const lastModified = new Date('2026-06-01T00:00:00Z')

  const doctorSitemaps = Array.from({ length: totalPages }, (_, i) => ({
    url: `${baseUrl}/sitemap-doctors-${i + 1}.xml`,
    lastModified,
  }))

  return [
    { url: `${baseUrl}/sitemap-pages.xml`, lastModified },
    { url: `${baseUrl}/sitemap-wilayas.xml`, lastModified },
    { url: `${baseUrl}/sitemap-specialites.xml`, lastModified },
    { url: `${baseUrl}/sitemap-conseils.xml`, lastModified },
    { url: `${baseUrl}/sitemap-meilleurs.xml`, lastModified },
    { url: `${baseUrl}/api/sitemap-doctors/ar-1`, lastModified },

    ...doctorSitemaps,
  ]
}