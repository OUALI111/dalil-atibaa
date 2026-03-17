import { supabase } from '../lib/supabase'

export default async function sitemap() {
  const baseUrl = 'https://dalil-atibaa.vercel.app'
  const pageSize = 50000

  // عدد الأطباء الكلي
  const { count } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const totalDoctors = count || 0
  const totalPages = Math.ceil(totalDoctors / pageSize)

  // توليد روابط sitemap-doctors تلقائياً
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
    ...doctorSitemaps,
  ]
}