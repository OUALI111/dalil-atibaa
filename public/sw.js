/**
 * Service Worker — Dalil Atibaa PWA
 * 
 * Stratégie de cache :
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Cache First   → Assets statiques (_next/static, icons, fonts) │
 * │  Network First → Pages dynamiques (docteur, recherche, ...)    │
 * │  Network Only  → API Supabase (données médicales toujours frais)│
 * └─────────────────────────────────────────────────────────────────┘
 */

const CACHE_NAME = 'dalil-atibaa-v1'
const STATIC_CACHE = 'dalil-atibaa-static-v1'
const PAGES_CACHE = 'dalil-atibaa-pages-v1'

// Assets VRAIMENT statiques à précacher (pas les pages SSR Next.js)
// Les pages HTML dynamiques sont cachées au fur et à mesure des visites
const PRECACHE_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/manifest.json',
]

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] 🔧 Installation en cours...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] 📦 Précache des assets statiques...')
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url =>
            fetch(url)
              .then(res => {
                if (res.ok) {
                  cache.put(url, res)
                  console.log('[SW] ✅ Précaché :', url)
                } else {
                  console.warn('[SW] ⚠️ Échec précache :', url, res.status)
                }
              })
              .catch(err => console.warn('[SW] ⚠️ Fetch échoué :', url, err.message))
          )
        )
      })
      .then(() => {
        console.log('[SW] ✅ Installation terminée — skipWaiting()')
        return self.skipWaiting()
      })
  )
})

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
// Supprime les anciens caches lors d'une mise à jour du SW
self.addEventListener('activate', (event) => {
  const VALID_CACHES = [STATIC_CACHE, PAGES_CACHE]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => !VALID_CACHES.includes(name))
          .map(name => {
            console.log('[SW] Suppression ancien cache :', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      // Prend le contrôle de toutes les pages ouvertes immédiatement
      return self.clients.claim()
    })
  )
})

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // ── 1. Ne jamais intercepter les requêtes non-GET ──────────────────────────
  if (request.method !== 'GET') return

  // ── 2. Network Only — API Supabase (données médicales toujours fraîches) ───
  // Les infos médicales (téléphones, adresses) doivent TOUJOURS venir du réseau
  if (url.hostname.includes('supabase.co')) return

  // ── 3. Network Only — Google Analytics, GTM ───────────────────────────────
  if (url.hostname.includes('googletagmanager.com') ||
      url.hostname.includes('google-analytics.com')) return

  // ── 4. Network Only — Chrome extensions et protocoles non-HTTP ────────────
  if (!url.protocol.startsWith('http')) return

  // ── 5. Cache First — Assets statiques Next.js (_next/static) ─────────────
  // CSS, JS, fonts : hachés dans le nom de fichier → toujours uniques par version
  if (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname === '/manifest.json') {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // ── 6. Network First — Pages HTML dynamiques ──────────────────────────────
  // Essaie le réseau en premier, fallback sur le cache si hors-ligne
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, PAGES_CACHE, 4000))
    return
  }

  // ── 7. Network First — Reste (requêtes API locales, etc.) ─────────────────
  event.respondWith(networkFirst(request, PAGES_CACHE, 4000))
})

// ─── STRATÉGIE : Cache First ──────────────────────────────────────────────────
// Retourne depuis le cache si présent, sinon fetch + met en cache
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Hors ligne — ressource non disponible', { status: 503 })
  }
}

// ─── STRATÉGIE : Network First ───────────────────────────────────────────────
// Essaie le réseau d'abord (timeout configurable), fallback sur le cache
async function networkFirst(request, cacheName, timeoutMs = 3000) {
  const cache = await caches.open(cacheName)

  try {
    // Race entre le fetch et un timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
      )
    ])

    if (networkResponse.ok) {
      // Met à jour le cache avec la réponse fraîche
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    // Réseau indisponible ou timeout → fallback sur le cache
    const cached = await cache.match(request)
    if (cached) return cached

    // Fallback ultime : page offline ou erreur 503
    return new Response(
      `<!DOCTYPE html>
      <html lang="fr"><head><meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Dalil Atibaa — Hors ligne</title>
      <style>
        body{font-family:system-ui,sans-serif;display:flex;align-items:center;
             justify-content:center;min-height:100vh;margin:0;background:#f8fafc;
             flex-direction:column;text-align:center;padding:2rem}
        .logo{width:56px;height:56px;background:#1A87D8;border-radius:14px;
              display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem}
        h1{color:#0f172a;font-size:1.5rem;margin:0 0 .5rem}
        p{color:#64748b;margin:0 0 2rem}
        a{background:#1A87D8;color:white;padding:.75rem 2rem;border-radius:8px;
          text-decoration:none;font-weight:600}
      </style></head>
      <body>
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="12" y="4" width="8" height="24" rx="2" fill="white"/>
            <rect x="4" y="12" width="24" height="8" rx="2" fill="white"/>
          </svg>
        </div>
        <h1>Vous êtes hors ligne</h1>
        <p>Vérifiez votre connexion internet pour accéder à Dalil Atibaa.</p>
        <a href="/">Réessayer</a>
      </body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
