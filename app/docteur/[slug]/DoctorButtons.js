'use client'

import { trackEvent } from './DoctorTracker'

export function CallButton({ doctorId, phone, className, children }) {
  return (
    <a
      href={`tel:${phone}`}
      className={className}
      onClick={() => trackEvent(doctorId, 'call_click')}
    >
      {children}
    </a>
  )
}

export function WhatsappButton({ doctorId, whatsappNumber, className, children }) {
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent(doctorId, 'whatsapp_click')}
    >
      {children}
    </a>
  )
}

export function MapButton({ doctorId, mapUrl, className, children }) {
  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent(doctorId, 'map_click')}
    >
      {children}
    </a>
  )
}
