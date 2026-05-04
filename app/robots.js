export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: '*',
        disallow: '/',
        host: 'dalil-atibaa.vercel.app',
      },
    ],
    sitemap: 'https://www.dalil-atibaa.com/sitemap.xml',
    host: 'https://www.dalil-atibaa.com',
  }
}