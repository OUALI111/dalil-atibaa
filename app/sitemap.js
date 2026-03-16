import { supabase } from '../lib/supabase'

export default async function sitemap() {
  const baseUrl = 'https://dalil-atibaa.dz'

  // صفحات الأطباء
  const { data: doctors } = await supabase
    .from('doctors')
    .select('slug, updated_at')
    .eq('is_active', true)

  // الولايات
  const { data: wilayas } = await supabase
    .from('wilayas')
    .select('slug')

  // التخصصات
  const { data: specialties } = await supabase
    .from('specialties')
    .select('slug')

  const doctorUrls = doctors?.map(d => ({
    url: `${baseUrl}/docteur/${d.slug}`,
    lastModified: d.updated_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  })) || []

  const wilayaUrls = wilayas?.map(w => ({
    url: `${baseUrl}/wilayas/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })) || []

  const specialtyUrls = specialties?.map(s => ({
    url: `${baseUrl}/specialites/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })) || []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/recherche`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...wilayaUrls,
    ...specialtyUrls,
    ...doctorUrls,
  ]
}