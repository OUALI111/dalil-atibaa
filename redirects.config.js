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
  // Sitemap doctors → géré par rewrite dans next.config.ts (réponse 200 directe)
  // ══════════════════════════════
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
