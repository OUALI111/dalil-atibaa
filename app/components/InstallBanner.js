'use client'

/**
 * InstallBanner — Dalil Atibaa PWA
 * Design : barre slim non-intrusive en bas de page (72px)
 * Pas d'overlay · Pas de fond sombre · Non-bloquant
 *
 * Android Chrome  → bouton "Installer" → prompt natif Chrome en 1 clic
 * iOS Safari      → barre + expansion douce avec 2 étapes visuelles
 *
 * 📊 Tracking GA4 :
 *   pwa_banner_shown      → banner affiché (android/ios)
 *   pwa_install_clicked   → clic sur "Installer"
 *   pwa_install_accepted  → utilisateur a accepté l'installation
 *   pwa_install_dismissed → utilisateur a refusé/fermé
 *   pwa_session_standalone→ visite depuis l'app déjà installée
 */

import { useEffect, useState, useCallback, useRef } from 'react'

const DISMISS_KEY  = 'dalil_install_dismissed'
const VISIT_KEY    = 'dalil_visit_count'
const DISMISS_DAYS = 7

// ─── Helper GA4 ────────────────────────────────────────────────────────────
function trackGA4(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: 'PWA',
        ...params,
      })
    }
  } catch (e) {}
}

// ─── Helper Supabase ────────────────────────────────────────────────────────
function trackPWASupabase(event, params = {}) {
  try {
    fetch('/api/pwa-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        platform: params.platform || null,
        page:     typeof window !== 'undefined' ? window.location.pathname : null,
        step:     params.step || null,
      }),
    }).catch(() => {})
  } catch (e) {}
}

// ─── Tracker combiné GA4 + Supabase ─────────────────────────────────────────
function track(eventName, params = {}) {
  trackGA4(eventName, params)
  trackPWASupabase(eventName.replace('pwa_', ''), params)
}



function isIosSafari() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true
}

function wasDismissedRecently() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    return (Date.now() - parseInt(ts)) / (1000 * 60 * 60 * 24) < DISMISS_DAYS
  } catch { return false }
}

function incrementVisit() {
  try {
    const count = parseInt(localStorage.getItem(VISIT_KEY) || '0') + 1
    localStorage.setItem(VISIT_KEY, String(count))
    return count
  } catch { return 1 }
}

export default function InstallBanner() {
  const [visible, setVisible]       = useState(false)
  const [platform, setPlatform]     = useState(null)   // 'android' | 'ios'
  const [iosExpanded, setIosExpanded] = useState(false) // étapes iOS visibles
  const [iosStep, setIosStep]       = useState(1)
  const [installing, setInstalling] = useState(false)
  const deferredPromptRef           = useRef(null)

  const tryShow = useCallback((plt) => {
    if (isStandalone() || wasDismissedRecently()) return
    setPlatform(plt)
    setVisible(true)
    // 📊 GA4 : banner affiché
    track('pwa_banner_shown', { platform: plt })
  }, [])

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      deferredPromptRef.current = e
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // 📊 GA4 : visite depuis l'app installée (mode standalone)
    if (isStandalone()) {
      track('pwa_session_standalone', {
        page: window.location.pathname,
      })
      return () => window.removeEventListener('beforeinstallprompt', onPrompt)
    }

    const visitCount = incrementVisit()

    if (visitCount >= 2) {
      const timer = setTimeout(() => {
        if (isIosSafari()) tryShow('ios')
        else if (deferredPromptRef.current) tryShow('android')
      }, 3000)
      return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', onPrompt) }
    }

    const onDoctorViewed = () => {
      setTimeout(() => {
        if (isIosSafari()) tryShow('ios')
        else if (deferredPromptRef.current) tryShow('android')
      }, 5000)
    }
    window.addEventListener('doctor-viewed', onDoctorViewed)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('doctor-viewed', onDoctorViewed)
    }
  }, [tryShow])

  const dismiss = useCallback(() => {
    setVisible(false)
    setIosExpanded(false)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
    // 📊 GA4 : utilisateur a fermé le banner sans installer
    track('pwa_install_dismissed', { platform })
  }, [platform])

  const install = useCallback(async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return
    setInstalling(true)
    // 📊 GA4 : clic sur le bouton "Installer"
    track('pwa_install_clicked', { platform: 'android' })
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      deferredPromptRef.current = null
      setVisible(false)
      if (outcome === 'accepted') {
        // 📊 GA4 : installation confirmée — l'événement le plus précieux !
        track('pwa_install_accepted', { platform: 'android' })
      } else {
        // 📊 GA4 : refus du prompt Chrome
        track('pwa_install_dismissed', { platform: 'android', step: 'chrome_prompt' })
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
      }
    } catch { setInstalling(false) }
  }, [])

  if (!visible || !platform) return null

  return (
    <>
      {/* ── Styles animation ────────────────────────────────────────────── */}
      <style>{`
        @keyframes dalilSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes dalilExpand {
          from { max-height: 0; opacity: 0; }
          to   { max-height: 280px; opacity: 1; }
        }
        .dalil-banner      { animation: dalilSlideUp 0.4s cubic-bezier(0.32,0.72,0,1) both; }
        .dalil-ios-steps   { animation: dalilExpand 0.3s ease both; overflow: hidden; }
      `}</style>

      {/* ── Barre principale ─────────────────────────────────────────────── */}
      <div
        className="dalil-banner fixed bottom-0 left-0 right-0 z-50"
        role="complementary"
        aria-label="Installer Dalil Atibaa"
      >
        {/* ── Étapes iOS (expansion vers le haut) ──────────────────────── */}
        {platform === 'ios' && iosExpanded && (
          <div
            className="dalil-ios-steps bg-white border-t border-gray-100 px-4 pt-4 pb-2"
            style={{ boxShadow: '0 -2px 0 rgba(0,0,0,0.04)' }}
          >
            {/* Navigation étapes */}
            <div className="flex gap-2 mb-3">
              {[1, 2].map(s => (
                <button
                  key={s}
                  onClick={() => setIosStep(s)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={iosStep === s
                    ? { backgroundColor: '#1A87D8', color: 'white' }
                    : { backgroundColor: '#F1F5F9', color: '#94A3B8' }}
                >
                  Étape {s} sur 2
                </button>
              ))}
            </div>

            {/* Étape 1 */}
            {iosStep === 1 && (
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L8 6h3v8h2V6h3L12 2z" fill="#1A87D8"/>
                    <rect x="4" y="10" width="16" height="12" rx="2" stroke="#1A87D8" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Appuyez sur ⬆ Partager</p>
                  <p className="text-xs text-gray-500">Le bouton en bas de la barre Safari</p>
                </div>
                <button
                  onClick={() => setIosStep(2)}
                  className="ml-auto flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: '#1A87D8' }}
                >
                  Suite →
                </button>
              </div>
            )}

            {/* Étape 2 */}
            {iosStep === 2 && (
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1A87D8" strokeWidth="1.5" fill="none"/>
                    <path d="M12 8v8M8 12h8" stroke="#1A87D8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Sur l&apos;écran d&apos;accueil</p>
                  <p className="text-xs text-gray-500">Faites défiler → appuyez sur <strong>« Sur l&apos;écran d&apos;accueil »</strong></p>
                </div>
                <button
                  onClick={dismiss}
                  className="ml-auto flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: '#22C55E' }}
                >
                  ✓ Fait
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Barre slim principale ─────────────────────────────────────── */}
        <div
          className="bg-white border-t border-gray-100 px-4"
          style={{
            boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            paddingTop: '14px',
          }}
        >
          <div className="flex items-center gap-3 max-w-lg mx-auto">

            {/* Icône app */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#1A87D8' }}
            >
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect x="13" y="5" width="6" height="22" rx="2" fill="white"/>
                <rect x="5" y="13" width="22" height="6" rx="2" fill="white"/>
              </svg>
            </div>

            {/* Texte copywriting — responsive mobile */}
            <div className="flex-1 overflow-hidden">
              {/* Ligne 1 : titre principal */}
              <p className="text-sm font-bold text-gray-900 leading-snug">
                Trouvez un médecin près de vous en 10 secondes.
              </p>
              {/* Ligne 2 : bénéfices condensés */}
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5 whitespace-nowrap">
                Gratuit · Hors-ligne · 24h/24
              </p>
            </div>

            {/* Bouton CTA */}
            {platform === 'android' && (
              <button
                onClick={install}
                disabled={installing}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white text-xs transition-all active:scale-95 disabled:opacity-70"
                style={{ backgroundColor: '#1A87D8' }}
                aria-label="Ajouter à l'écran d'accueil"
              >
                {installing ? (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Installer
                  </>
                )}
              </button>
            )}

            {platform === 'ios' && (
              <button
                onClick={() => setIosExpanded(v => !v)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white text-xs transition-all active:scale-95"
                style={{ backgroundColor: '#1A87D8' }}
                aria-label="Voir comment installer"
                aria-expanded={iosExpanded}
              >
                {iosExpanded ? 'Masquer' : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Installer
                  </>
                )}
              </button>
            )}

            {/* Bouton fermer */}
            <button
              onClick={dismiss}
              aria-label="Fermer"
              className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>

          </div>
        </div>
      </div>
    </>
  )
}
