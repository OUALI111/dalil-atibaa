'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConseilGpsButton({ specialtySlug, children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSearchGPS = () => {
    if (!navigator?.geolocation) {
      // Si non supporté, redirection classique
      router.push(`/recherche?specialite=${specialtySlug}`)
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // Redirection vers la page de recherche avec les coordonnées GPS
        router.push(`/recherche?specialite=${specialtySlug}&lat=${coords.latitude}&lng=${coords.longitude}`)
      },
      (err) => {
        console.warn("Géolocalisation refusée ou indisponible, redirection classique :", err)
        // Redirection classique vers la recherche de spécialité
        router.push(`/recherche?specialite=${specialtySlug}`)
      },
      { timeout: 6000, maximumAge: 600000, enableHighAccuracy: false }
    )
  }

  return (
    <button
      onClick={handleSearchGPS}
      disabled={loading}
      style={{ backgroundColor: '#1E293B' }}
      className="inline-flex items-center gap-2 hover:opacity-90 active:opacity-100 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition disabled:opacity-75"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Localisation...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {children ? children : 'Trouver un médecin près de moi'}
        </>
      )}
    </button>
  )
}
