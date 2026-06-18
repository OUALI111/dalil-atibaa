'use client'

import { useEffect } from 'react'

export function trackEvent(doctorId, eventType) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_id: doctorId, event_type: eventType }),
    keepalive: true,
  }).catch(() => {})
}

export default function DoctorTracker({ doctorId }) {
  useEffect(() => {
    if (doctorId) {
      trackEvent(doctorId, 'view')
    }
  }, [doctorId])

  return null
}
