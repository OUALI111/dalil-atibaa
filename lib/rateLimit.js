/**
 * lib/rateLimit.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Rate limiter in-memory simple — pas besoin de Redis à cette échelle.
 *
 * Fonctionnement :
 *   - Un Map global stocke { start, count } par clé "route:ip"
 *   - Si count dépasse la limite dans la fenêtre → bloqué
 *   - La fenêtre se réinitialise automatiquement après windowMs
 *   - Nettoyage automatique des entrées expirées toutes les 5 minutes
 *
 * Limitation Vercel Serverless :
 *   Chaque instance de fonction a sa propre mémoire.
 *   Le rate limiting est "best effort" — il protège contre les abus simples
 *   mais pas contre un attaquant qui distribue ses requêtes sur plusieurs IPs.
 *   Pour une protection totale, utiliser Cloudflare WAF ou Redis.
 *   À notre échelle (~8 000 visiteurs/mois), cette solution est largement suffisante.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const store = new Map()

// Nettoyage automatique des entrées expirées pour éviter les fuites mémoire
// Tourne une fois au chargement du module, puis toutes les 5 minutes
function cleanup(windowMs) {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now - record.start > windowMs) {
      store.delete(key)
    }
  }
}

setInterval(() => cleanup(60 * 60 * 1000), 5 * 60 * 1000) // nettoyage toutes les 5 min

/**
 * Extrait l'IP réelle depuis les headers Vercel/Cloudflare
 */
export function getClientIp(request) {
  // Cloudflare pose CF-Connecting-IP en premier
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  // Vercel / proxy standard
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  return 'unknown'
}

/**
 * Vérifie si une IP est dans les limites autorisées.
 *
 * @param {Object} options
 * @param {string} options.ip       - Adresse IP du client
 * @param {string} options.route    - Nom de la route (ex: 'track', 'pwa-track')
 * @param {number} options.limit    - Nombre maximum de requêtes autorisées
 * @param {number} options.windowMs - Fenêtre de temps en millisecondes
 * @returns {{ limited: boolean, retryAfter?: number }}
 */
export function rateLimit({ ip, route, limit, windowMs }) {
  const now   = Date.now()
  const key   = `${route}:${ip}`
  const record = store.get(key)

  // Nouvelle entrée ou fenêtre expirée → reset
  if (!record || now - record.start > windowMs) {
    store.set(key, { start: now, count: 1 })
    return { limited: false }
  }

  record.count++

  if (record.count > limit) {
    const retryAfter = Math.ceil((record.start + windowMs - now) / 1000)
    return { limited: true, retryAfter }
  }

  return { limited: false }
}
