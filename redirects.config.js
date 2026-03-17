// ══════════════════════════════════════════
// نظام Redirects المركزي
// أضف كل redirect هنا فقط
// ══════════════════════════════════════════

const redirectsList = [

  // ══════════════════════════════
  // Redirects قديمة — أمثلة
  // ══════════════════════════════

  // إذا غيّرت slug طبيب
  // {
  //   source: '/docteur/ancien-slug',
  //   destination: '/docteur/nouveau-slug',
  //   permanent: true,
  // },

  // إذا غيّرت اسم ولاية
  // {
  //   source: '/wilayas/alger',
  //   destination: '/wilayas/alger-capital',
  //   permanent: true,
  // },

  // ══════════════════════════════
  // Redirects تقنية — لا تحذف
  // ══════════════════════════════
  {
    source: '/:path*.html',
    destination: '/:path*',
    permanent: true,
  },
  {
    source: '/:path*.php',
    destination: '/:path*',
    permanent: true,
  },
  {
    source: '/index.html',
    destination: '/',
    permanent: true,
  },
  {
    source: '/index.php',
    destination: '/',
    permanent: true,
  },
  {
    source: '/sitemap-doctors-:page.xml',
    destination: '/api/sitemap-doctors/:page',
    permanent: false,
  },
]

module.exports = redirectsList