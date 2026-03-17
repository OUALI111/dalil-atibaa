export default function sitemap() {
  const baseUrl = 'https://dalil-atibaa.vercel.app'

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
      url: `${baseUrl}/sitemap-doctors-1.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-doctors-2.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-doctors-3.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-doctors-4.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-doctors-5.xml`,
      lastModified: new Date(),
    },
  ]
}