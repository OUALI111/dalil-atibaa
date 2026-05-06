export const dynamic = 'force-dynamic'

import { supabase } from '../lib/supabase'

export default async function sitemap() {
  const baseUrl = 'https://www.dalil-atibaa.com'
  const pageSize = 50000

  const { count } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const totalDoctors = count || 0
  const totalPages = Math.ceil(totalDoctors / pageSize)

  const doctorSitemaps = Array.from({ length: totalPages }, (_, i) => ({
    url: `${baseUrl}/sitemap-doctors-${i + 1}.xml`,
    lastModified: new Date(),
  }))

  return [
    {
      url: `${baseUrl}/sitemap-pages.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-wilayas.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-specialites.xml`,
      lastModified: new Date(),
    },

    {
  url: `${baseUrl}/sitemap-conseils.xml`,
  lastModified: new Date(),
   },
   {
  url: `${baseUrl}/sitemap-meilleurs.xml`,
  lastModified: new Date(),
},
    ...doctorSitemaps,
  ]
}