const redirectsList = [
  // ══════════════════════════════
  // Redirections techniques — 301
  // ══════════════════════════════
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
    source: '/:path*.html',
    destination: '/:path*',
    permanent: true,
  },
  {
    source: '/:path*.php',
    destination: '/:path*',
    permanent: true,
  },
  // ══════════════════════════════
  // Sitemap doctors — 302 temporaire
  // ══════════════════════════════
  {
    source: '/sitemap-doctors-:page.xml',
    destination: '/api/sitemap-doctors/:page',
    permanent: false,
  },
  // ══════════════════════════════
  // Anciennes URLs — ajoute ici
  // ══════════════════════════════
  // Exemple:
  // {
  //   source: '/medecins/:path*',
  //   destination: '/docteur/:path*',
  //   permanent: true,
  // },
]

module.exports = redirectsList
