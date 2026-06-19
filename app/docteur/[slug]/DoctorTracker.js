'use client'

import { useEffect } from 'react'

// ─── Liste des patterns de bots connus ────────────────────────────────────────
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /search/i,
  /fetch/i, /curl/i, /wget/i, /python/i, /java\//i,
  /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /applebot/i, /duckduckbot/i, /semrushbot/i, /ahrefsbot/i,
  /mj12bot/i, /dotbot/i, /petalbot/i, /gptbot/i, /ccbot/i,
  /claudebot/i, /bytespider/i, /headlesschrome/i,
]

function isBot() {
  const ua = navigator?.userAgent || ''
  return BOT_PATTERNS.some(p => p.test(ua))
}

// ─── Génère un ID visiteur unique par session navigateur ──────────────────────
function getVisitorId() {
  try {
    let id = sessionStorage.getItem('_vid')
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('_vid', id)
    }
    return id
  } catch {
    return 'anon'
  }
}

// ─── Détecte l'origine du visiteur ───────────────────────────────────────────
function getReferrer() {
  try {
    const ref = document.referrer
    if (!ref) return 'direct'
    const host = new URL(ref).hostname.replace('www.', '')
    if (host.includes('google'))   return 'google'
    if (host.includes('facebook')) return 'facebook'
    if (host.includes('bing'))     return 'bing'
    if (host.includes('yahoo'))    return 'yahoo'
    if (host.includes('twitter') || host.includes('t.co')) return 'twitter'
    if (host.includes('instagram')) return 'instagram'
    if (host.includes('youtube'))  return 'youtube'
    if (host.includes('tiktok'))   return 'tiktok'
    if (host.includes('linkedin')) return 'linkedin'
    if (host.includes('whatsapp')) return 'whatsapp'
    return host || 'other'
  } catch {
    return 'other'
  }
}

// ─── Fonction principale d'envoi d'événement ─────────────────────────────────
export function trackEvent(doctorId, eventType) {
  // Filtrer les bots côté client
  if (isBot()) return

  const visitor_id = getVisitorId()
  const referrer   = eventType === 'view' ? getReferrer() : undefined

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_id: doctorId, event_type: eventType, visitor_id, referrer }),
    keepalive: true,
  }).catch(() => {})
}

// ─── Composant React qui déclenche la vue ────────────────────────────────────
export default function DoctorTracker({ doctorId }) {
  useEffect(() => {
    if (doctorId) {
      trackEvent(doctorId, 'view')
    }
  }, [doctorId])

  return null
}
