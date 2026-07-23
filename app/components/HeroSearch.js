'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Constantes ───────────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [5, 10, 20, 50]
const GPS_CACHE_KEY  = 'dalil_user_position'
const GPS_CACHE_TTL  = 10 * 60 * 1000
const PAGE_SIZE      = 20

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}
function getCachedPosition() {
  try {
    const raw = sessionStorage.getItem(GPS_CACHE_KEY)
    if (!raw) return null
    const { lat, lng, ts } = JSON.parse(raw)
    if (Date.now() - ts > GPS_CACHE_TTL) { sessionStorage.removeItem(GPS_CACHE_KEY); return null }
    return { lat, lng }
  } catch { return null }
}
function cachePosition(lat, lng) {
  try { sessionStorage.setItem(GPS_CACHE_KEY, JSON.stringify({ lat, lng, ts: Date.now() })) } catch {}
}

// ─── Icônes ───────────────────────────────────────────────────────────────────
function IconSpecialty() {
  return (
    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M12 12v4m-2-2h4" />
    </svg>
  )
}
function IconLocation({ active }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${active ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconGPSArrow({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ─── Ligne résultat médecin ────────────────────────────────────────────────────
function DoctorRow({ doctor }) {
  return (
    <div className="flex items-start justify-between px-4 sm:px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 transition-colors group">

      {/* ── Gauche : lien vers la fiche ──────────────────────── */}
      <Link href={`/docteur/${doctor.slug}`} className="flex items-start gap-3 min-w-0 flex-1">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Infos */}
        <div className="min-w-0">
          {/* Nom */}
          <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
            {doctor.name_fr}
          </p>

          {/* Spécialité */}
          {doctor.specialty_name && (
            <span className="inline-block text-xs text-blue-500 font-medium mt-0.5">
              {doctor.specialty_name}
            </span>
          )}

          {/* Adresse (priorité) ou Wilaya (fallback) */}
          {doctor.address ? (
            <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {doctor.address}
            </p>
          ) : doctor.wilaya_name ? (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {doctor.wilaya_name}
            </p>
          ) : null}
        </div>
      </Link>

      {/* ── Droite : distance + appeler ──────────────────────── */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
        {/* Badge distance */}
        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 whitespace-nowrap">
          <IconGPSArrow className="w-3 h-3" />
          {formatDistance(doctor.distance_km)}
        </span>

        {/* Bouton Appeler (click-to-call) */}
        {doctor.phone ? (
          <a
            href={`tel:${doctor.phone}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-green-700 text-xs font-semibold bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-full border border-green-200 transition-colors whitespace-nowrap"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Appeler
          </a>
        ) : (
          <Link href={`/docteur/${doctor.slug}`} className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5">
            Voir profil
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}


// ─── Composant principal ───────────────────────────────────────────────────────
export default function HeroSearch({ specialties = [], wilayas = [], defaultSpecialty = '', defaultWilaya = '' }) {
  const [specId, setSpecId]       = useState(() => {
    if (!defaultSpecialty) return ''
    const found = specialties.find(s => s.slug === defaultSpecialty)
    return found ? String(found.id) : ''
  })
  const [wilayaId, setWilayaId]   = useState(() => {
    if (!defaultWilaya) return ''
    const found = wilayas.find(w => w.slug === defaultWilaya)
    return found ? String(found.id) : ''
  })
  const [gpsMode, setGpsMode]     = useState(false)
  const [gpsStatus, setGpsStatus] = useState('idle')
  const [results, setResults]     = useState([])
  const [radius, setRadius]       = useState(10)
  const [userPos, setUserPos]     = useState(null)
  const [errorMsg, setErrorMsg]   = useState('')
  const [page, setPage]           = useState(0)
  const [hasMore, setHasMore]     = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])



  const fetchNearby = useCallback(async (lat, lng, km, sid, p = 0) => {
    setGpsStatus('loading')
    const params = new URLSearchParams({ lat, lng, radius: km, page: p })
    if (sid) params.set('specialty_id', sid)
    try {
      const res  = await fetch(`/api/nearby?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      if (!json.results?.length) {
        setGpsStatus('no-results'); if (p === 0) setResults([])
        // Tracking : recherche GPS sans résultat
        if (p === 0) fetch('/api/search-track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ specialty_id: sid ? Number(sid) : null, results_count: 0, gps_used: true }) }).catch(() => {})
      } else {
        setGpsStatus('success')
        setResults(prev => p === 0 ? json.results : [...prev, ...json.results])
        setHasMore(json.results.length === PAGE_SIZE)
        // Tracking : recherche GPS avec résultats (seulement la 1ère page)
        if (p === 0) fetch('/api/search-track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ specialty_id: sid ? Number(sid) : null, results_count: json.results.length, gps_used: true }) }).catch(() => {})
      }
    } catch { setGpsStatus('error'); setErrorMsg('Impossible de charger les résultats. Réessayez.') }
  }, [])

  // Met à jour specId pour filtrer les résultats GPS quand la spécialité change
  const handleSpecChange = (e) => {
    const slug  = e.target.value
    const found = specialties.find(s => s.slug === slug)
    const id    = found ? String(found.id) : ''
    setSpecId(id)
    if (gpsMode && userPos) { setPage(0); fetchNearby(userPos.lat, userPos.lng, radius, id, 0) }
  }

  // Met à jour wilayaId pour le tracking du formulaire
  const handleWilayaChange = (e) => {
    const slug  = e.target.value
    const found = wilayas.find(w => w.slug === slug)
    setWilayaId(found ? String(found.id) : '')
  }

  // Tracking : envoi sendBeacon au submit (ne bloque pas la navigation)
  const handleFormSubmit = () => {
    try {
      const payload = JSON.stringify({
        wilaya_id:    wilayaId    ? Number(wilayaId)    : null,
        specialty_id: specId      ? Number(specId)      : null,
        gps_used: false,
      })
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon?.('/api/search-track', blob)
    } catch {}
  }

  const handleGPS = useCallback(() => {
    setGpsMode(true)
    const cached = getCachedPosition()
    if (cached) {
      setUserPos(cached); setPage(0)
      fetchNearby(cached.lat, cached.lng, radius, specId, 0); return
    }
    if (!navigator?.geolocation) {
      setGpsStatus('error'); setErrorMsg('Géolocalisation non supportée.'); return
    }
    setGpsStatus('requesting')

    // ✅ FIX GPS COLD START — auto-retry jusqu'à 3 fois avec timeout croissant
    // 1er essai : 8s  (GPS chaud → ça marche)
    // 2e essai  : 12s (GPS tiède → ça marche)
    // 3e essai  : 18s (GPS froid → dernier recours)
    // L'utilisateur ne voit JAMAIS l'erreur sur les 2 premiers essais
    const TIMEOUTS = [8000, 12000, 18000]

    const tryGetPosition = (attempt) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const pos = { lat: coords.latitude, lng: coords.longitude }
          setUserPos(pos); cachePosition(pos.lat, pos.lng)
          setPage(0); fetchNearby(pos.lat, pos.lng, radius, specId, 0)
        },
        (err) => {
          if (err.code === 3 && attempt < TIMEOUTS.length - 1) {
            // Timeout → retry silencieux, l'utilisateur continue de voir "Recherche en cours..."
            tryGetPosition(attempt + 1)
          } else {
            // Echec définitif → afficher l'erreur
            setGpsStatus('error')
            if (err.code === 1)      setErrorMsg('Accès refusé. Autorisez la géolocalisation dans votre navigateur.')
            else if (err.code === 3) setErrorMsg('Délai GPS dépassé. Réessayez.')
            else                     setErrorMsg('Impossible de localiser votre position.')
          }
        },
        { timeout: TIMEOUTS[attempt], maximumAge: 600000, enableHighAccuracy: false }
      )
    }

    tryGetPosition(0)
  }, [radius, specId, fetchNearby])


  const exitGPS = () => {
    setGpsMode(false); setGpsStatus('idle')
    setResults([]); setUserPos(null); setPage(0)
  }

  const changeRadius = (km) => {
    setRadius(km)
    if (userPos) { setPage(0); fetchNearby(userPos.lat, userPos.lng, km, specId, 0) }
  }

  const loadMore = () => {
    const next = page + 1; setPage(next)
    if (userPos) fetchNearby(userPos.lat, userPos.lng, radius, specId, next)
  }

  // Déclencheur GPS automatique si l'URL a &gps=1
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('gps') === '1') {
        const timer = setTimeout(() => {
          document.getElementById('gps-trigger-button')?.click()
        }, 800)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const isLoading = gpsStatus === 'requesting' || gpsStatus === 'loading'

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative z-10">

      {/* ══ FORMULAIRE ══════════════════════════════════════════════════════════ */}
      <form
        action="/recherche"
        method="GET"
        onSubmit={handleFormSubmit}
        className="bg-white rounded-2xl shadow-2xl overflow-visible"
      >
        {/* Ligne principale */}
        <div className="flex flex-col sm:flex-row">

          {/* ── Spécialité ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
            <IconSpecialty />
            <div className="flex-1 min-w-0">
              <select
                name="specialite"
                aria-label="Choisir une spécialité médicale"
                defaultValue={defaultSpecialty}
                onChange={handleSpecChange}
                className="w-full text-gray-700 text-sm focus:outline-none bg-white cursor-pointer"
              >
                <option value="">Toutes les spécialités</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.slug}>{s.name_fr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Wilaya OU Position actuelle ────────────────────────── */}
          <div className={`flex items-center gap-3 flex-1 px-4 py-4 border-b sm:border-b-0 sm:border-r border-gray-100 transition-colors ${gpsMode ? 'bg-blue-50' : 'bg-white'}`}>
            <IconLocation active={gpsMode} />

            {gpsMode ? (
              /* Mode GPS : affiche "Position actuelle" + bouton X */
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-blue-600 text-sm font-medium">Position actuelle</span>
                <button
                  type="button"
                  onClick={exitGPS}
                  aria-label="Annuler la géolocalisation"
                  className="ml-2 p-1 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Mode normal : select Wilaya */
              <div className="flex-1 min-w-0">
                <select
                  name="wilaya"
                  aria-label="Choisir une wilaya"
                  defaultValue={defaultWilaya}
                  onChange={handleWilayaChange}
                  className="w-full text-gray-700 text-sm focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">Toutes les wilayas</option>
                  {wilayas.map(w => (
                    <option key={w.id} value={w.slug}>{w.name_fr}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Actions : GPS + Rechercher ──────────────────────────── */}
          <div className="flex gap-2 p-2.5">

            {/* Bouton GPS — flex-1 pour être égal au bouton Rechercher */}
            <button
              id="gps-trigger-button"
              type="button"
              onClick={gpsMode ? exitGPS : handleGPS}
              aria-label="Trouver les médecins près de moi"
              title={gpsMode ? 'Annuler la géolocalisation' : 'Trouver les médecins près de moi'}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                gpsMode
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconGPSArrow className="w-4 h-4" />
              )}
              {/* Texte visible sur TOUS les écrans */}
              <span>
                {gpsMode ? 'Position active' : 'Près de moi'}
              </span>
            </button>

            {/* Bouton Rechercher */}
            {!gpsMode && (
              <button
                type="submit"
                style={{ backgroundColor: '#1E293B' }}
                className="flex-1 bg-[#1E293B] hover:opacity-90 active:opacity-100 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap shadow-sm"
              >
                Rechercher
              </button>
            )}
          </div>
        </div>
      </form>

      {/* ══ RÉSULTATS GPS (carte blanche sous le formulaire) ════════════════════ */}
      {gpsMode && (
        <>
          {isMounted && (
            <style dangerouslySetInnerHTML={{ __html: `
              #static-results-container { display: none !important; }
            `}} />
          )}
          <div className="mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden text-left border border-gray-100">

          {/* Filtres rayon */}
          {userPos && !isLoading && (
            <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50">
              <span className="text-xs text-gray-500 font-medium">Rayon de recherche :</span>
              {RADIUS_OPTIONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => changeRadius(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    radius === r
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          )}

          {/* Chargement GPS */}
          {gpsStatus === 'requesting' && (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Récupération de votre position...</span>
            </div>
          )}

          {/* Chargement résultats */}
          {gpsStatus === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Recherche des médecins proches...</span>
            </div>
          )}

          {/* Erreur */}
          {gpsStatus === 'error' && (
            <div className="flex items-start gap-3 px-5 py-5">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm text-red-600">{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleGPS}
                  className="mt-2 text-blue-600 text-sm font-semibold hover:underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Aucun résultat */}
          {gpsStatus === 'no-results' && (
            <div className="text-center py-10 px-4">
              <p className="text-2xl mb-2">🔍</p>
              <p className="font-semibold text-gray-700 text-sm">Aucun médecin à moins de {radius} km</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Élargissez votre zone de recherche</p>
              {radius < 50 && (
                <button
                  type="button"
                  onClick={() => changeRadius(radius === 5 ? 10 : radius === 10 ? 20 : 50)}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Élargir à {radius === 5 ? 10 : radius === 10 ? 20 : 50} km →
                </button>
              )}
            </div>
          )}

          {/* Résultats */}
          {gpsStatus === 'success' && results.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">{results.length}</span>
                  {' '}médecin{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                  {' '}· triés par distance · rayon {radius} km
                </p>
              </div>
              <div>
                {results.map(doc => <DoctorRow key={doc.id} doctor={doc} />)}
              </div>
              {hasMore && (
                <div className="text-center py-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={loadMore}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition"
                  >
                    Voir plus de médecins →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </>
      )}
    </div>
  )
}
