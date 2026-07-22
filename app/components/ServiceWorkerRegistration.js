'use client'

/**
 * ServiceWorkerRegistration
 * 
 * Composant client invisible qui enregistre le service worker au chargement.
 * - Désactivé automatiquement en développement (NODE_ENV !== 'production')
 * - Enregistré une seule fois, puis géré par le navigateur
 * - Logs dans la console pour faciliter le debug
 */

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // ✅ Ne pas enregistrer en dev : évite les conflits de cache avec le hot-reload
    if (process.env.NODE_ENV !== 'production') return

    // ✅ Vérifier le support navigateur
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service Workers non supportés par ce navigateur.')
      return
    }

    const registerSW = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] ✅ Enregistré avec succès — scope :', registration.scope)
          // Vérifier les mises à jour du SW toutes les heures
          setInterval(() => registration.update(), 60 * 60 * 1000)
        })
        .catch((error) => {
          console.error('[SW] ❌ Échec enregistrement :', error)
        })
    }

    // ✅ FIX Next.js App Router : l'événement 'load' se déclenche AVANT
    // l'hydratation React → le listener classique ne s'enregistre jamais.
    // On vérifie si la page est déjà chargée et on enregistre immédiatement.
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
      return () => window.removeEventListener('load', registerSW)
    }
  }, [])

  // Ce composant ne rend rien visuellement
  return null
}
