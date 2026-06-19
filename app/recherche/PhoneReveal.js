'use client'
import { useState } from 'react'

export default function PhoneReveal({ phone }) {
  const [revealed, setRevealed] = useState(false)

  if (!phone) return null

  // Masque : garde les 4 premiers chiffres visibles
  const masked = phone.replace(/\s/g, '')
  const visible = masked.slice(0, 4)
  const maskedDisplay = `${visible} •• •• ••`

  if (revealed) {
    return (
      <a
        href={`tel:${phone}`}
        className="text-green-600 text-xs font-medium flex items-center gap-1.5 group"
        onClick={e => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>{phone}</span>
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={e => { e.preventDefault(); e.stopPropagation(); setRevealed(true) }}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition group w-full text-left"
    >
      <svg className="w-3.5 h-3.5 shrink-0 text-gray-300 group-hover:text-green-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      <span className="font-mono tracking-wide">{maskedDisplay}</span>
      <span className="text-blue-500 font-medium group-hover:underline ml-1">Afficher →</span>
    </button>
  )
}
