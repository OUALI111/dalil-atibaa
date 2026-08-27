/**
 * opengraph-image.js — OG Image pour fiches médecin (version arabe /ar/)
 * ─────────────────────────────────────────────────────────────────────────────
 * Même design que la version FR, avec le nom arabe du médecin si disponible.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 3600

const BRAND_BLUE  = '#1A87D8'
const BRAND_DARK  = '#1E293B'
const BRAND_DARK2 = '#0F172A'

export default async function OGImageAr({ params }) {
  const { slug } = await params

  let doctorName    = 'طبيب متخصص'
  let specialtyName = ''
  let wilayaName    = ''

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: doctor } = await supabase
      .from('doctors')
      .select('name_ar, name_fr, specialties(name_ar, name_fr), wilayas(name_ar, name_fr)')
      .eq('slug', slug)
      .single()

    if (doctor) {
      // Préfère le nom arabe, fallback sur le nom français
      doctorName    = doctor.name_ar    || doctor.name_fr    || doctorName
      specialtyName = doctor.specialties?.name_ar || doctor.specialties?.name_fr || ''
      wilayaName    = doctor.wilayas?.name_ar     || doctor.wilayas?.name_fr     || ''
    }
  } catch (_) {
    // Fallback silencieux
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BRAND_DARK,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Barre décorative en haut ───────────────────────────── */}
        <div style={{ width: '1200px', height: '8px', backgroundColor: BRAND_BLUE, flexShrink: 0 }} />

        {/* ── Cercles décoratifs ─────────────────────────────────── */}
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '450px', height: '450px', borderRadius: '50%', backgroundColor: BRAND_BLUE, opacity: 0.07, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: BRAND_BLUE, opacity: 0.05, display: 'flex' }} />

        {/* ── Contenu (RTL pour l'arabe) ─────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 90px',
            // Note : Satori ne supporte pas direction:rtl nativement,
            // on aligne à droite via textAlign
          }}
        >
          {specialtyName ? (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ backgroundColor: BRAND_BLUE, color: 'white', fontSize: '22px', fontWeight: '600', padding: '8px 24px', borderRadius: '100px', display: 'flex' }}>
                {specialtyName}
              </div>
            </div>
          ) : null}

          <div style={{ fontSize: doctorName.length > 40 ? '54px' : '66px', fontWeight: '800', color: 'white', lineHeight: 1.15, marginBottom: '28px', display: 'flex' }}>
            {doctorName}
          </div>

          {wilayaName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={BRAND_BLUE} />
              </svg>
              <span style={{ fontSize: '30px', color: '#94A3B8', fontWeight: '500', display: 'flex' }}>
                {wilayaName}، الجزائر
              </span>
            </div>
          ) : null}
        </div>

        {/* ── Pied de page ───────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 90px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: BRAND_BLUE, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 8H20L14.5 12L16.5 18L12 14L7.5 18L9.5 12L4 8H10.5L12 2Z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: '26px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', display: 'flex' }}>
              dalil-atibaa.com
            </span>
          </div>
          <span style={{ fontSize: '20px', color: '#64748B', display: 'flex' }}>
            ابحث عن طبيبك في الجزائر
          </span>
        </div>

        {/* ── Barre décorative en bas ────────────────────────────── */}
        <div style={{ width: '1200px', height: '6px', background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${BRAND_DARK2} 100%)`, flexShrink: 0, display: 'flex' }} />
      </div>
    ),
    { ...size }
  )
}
