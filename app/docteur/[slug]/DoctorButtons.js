'use client'

import { trackEvent } from './DoctorTracker'

// ✅ Bug #18 : aria-label ajouté sur chaque bouton pour l'accessibilité
// Sans aria-label, les lecteurs d'écran annoncent juste "lien" sans contexte.
// Avec aria-label, ils annoncent "Appeler Dr. Benali" → navigation accessible.

export function CallButton({ doctorId, phone, className, style, children, doctorName }) {
  return (
    <a
      href={`tel:${phone}`}
      className={className}
      style={style}
      aria-label={doctorName ? `Appeler ${doctorName}` : 'Appeler le médecin'}
      onClick={() => trackEvent(doctorId, 'call_click')}
    >
      {children}
    </a>
  )
}

export function WhatsappButton({ doctorId, whatsappNumber, className, children, doctorName }) {
  // ✅ Guard au niveau composant : jamais de href="wa.me/undefined" même si le parent oublie
  if (!whatsappNumber) return null

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={doctorName ? `Contacter ${doctorName} sur WhatsApp (nouvelle fenêtre)` : 'Contacter sur WhatsApp (nouvelle fenêtre)'}
      onClick={() => trackEvent(doctorId, 'whatsapp_click')}
    >
      {children}
    </a>
  )
}

export function MapButton({ doctorId, mapUrl, className, children, doctorName }) {
  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={doctorName ? `Voir la localisation de ${doctorName} sur la carte (nouvelle fenêtre)` : 'Voir sur la carte (nouvelle fenêtre)'}
      onClick={() => trackEvent(doctorId, 'map_click')}
    >
      {children}
    </a>
  )
}
