/**
 * opengraph-image.js — Génération automatique OG Image pour fiches médecin (FR)
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js App Router détecte ce fichier automatiquement et l'expose à l'URL :
 *   /docteur/[slug]/opengraph-image
 *
 * Facebook, WhatsApp, LinkedIn, Twitter lisent le meta tag og:image qui pointe
 * vers cette URL et affichent une belle carte 1200×630 pour chaque fiche médecin.
 *
 * Rendu : Satori (moteur JSX → PNG via Edge Runtime).
 * Contraintes Satori : styles inline uniquement, pas de Tailwind, flex layout.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

// ✅ Edge Runtime : rendu ultra-rapide directement sur le CDN Vercel
export const runtime = 'edge'

// ✅ Dimensions standard OG image (Facebook, Twitter, LinkedIn, WhatsApp)
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// ✅ Revalidation : même durée que la page (1h)
export const revalidate = 3600

// Couleurs brand Dalil Atibaa (cf. tailwind.config.js)
const BRAND_BLUE  = '#1A87D8'
const BRAND_DARK  = '#1E293B'
const BRAND_DARK2 = '#0F172A'

export default async function OGImage({ params }) {
  const { slug } = await params

  // ─── Fetch données médecin depuis Supabase ────────────────────────────────
  // Note : on ne peut pas utiliser le cache() React ici (Edge Runtime isolé).
  // C'est un fetch séparé, mais il n'est déclenché QUE par les crawlers sociaux
  // (Facebook, WhatsApp, etc.) — pas par les visiteurs normaux.
  let doctorName = 'Médecin Spécialiste'
  let specialtyName = ''
  let wilayaName = ''

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: doctor } = await supabase
      .from('doctors')
      .select('name_fr, specialties(name_fr), wilayas(name_fr)')
      .eq('slug', slug)
      .single()

    if (doctor) {
      doctorName   = doctor.name_fr || doctorName
      specialtyName = doctor.specialties?.name_fr || ''
      wilayaName   = doctor.wilayas?.name_fr || ''
    }
  } catch (_) {
    // En cas d'erreur Supabase, on affiche l'image générique sans données
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
        <div
          style={{
            width: '1200px',
            height: '8px',
            backgroundColor: BRAND_BLUE,
            flexShrink: 0,
          }}
        />

        {/* ── Cercles décoratifs en arrière-plan ────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            backgroundColor: BRAND_BLUE,
            opacity: 0.07,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: BRAND_BLUE,
            opacity: 0.05,
            display: 'flex',
          }}
        />

        {/* ── Contenu principal ──────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 90px',
          }}
        >
          {/* Badge spécialité */}
          {specialtyName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  backgroundColor: BRAND_BLUE,
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: '600',
                  padding: '8px 24px',
                  borderRadius: '100px',
                  letterSpacing: '0.5px',
                  display: 'flex',
                }}
              >
                {specialtyName}
              </div>
            </div>
          ) : null}

          {/* Nom du médecin */}
          <div
            style={{
              fontSize: doctorName.length > 40 ? '54px' : '66px',
              fontWeight: '800',
              color: 'white',
              lineHeight: 1.15,
              marginBottom: '28px',
              display: 'flex',
            }}
          >
            {doctorName}
          </div>

          {/* Localisation */}
          {wilayaName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {/* Icône localisation SVG */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill={BRAND_BLUE}
                />
              </svg>
              <span
                style={{
                  fontSize: '30px',
                  color: '#94A3B8',
                  fontWeight: '500',
                  display: 'flex',
                }}
              >
                {wilayaName}, Algérie
              </span>
            </div>
          ) : null}
        </div>

        {/* ── Pied de page — branding ────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 90px',
            borderTop: `1px solid rgba(255,255,255,0.08)`,
          }}
        >
          {/* Logo textuel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: BRAND_BLUE,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 8H20L14.5 12L16.5 18L12 14L7.5 18L9.5 12L4 8H10.5L12 2Z" fill="white"/>
              </svg>
            </div>
            <span
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-0.5px',
                display: 'flex',
              }}
            >
              dalil-atibaa.com
            </span>
          </div>

          {/* Tagline */}
          <span
            style={{
              fontSize: '20px',
              color: '#64748B',
              display: 'flex',
            }}
          >
            Trouvez votre médecin en Algérie
          </span>
        </div>

        {/* ── Barre décorative en bas ────────────────────────────── */}
        <div
          style={{
            width: '1200px',
            height: '6px',
            background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${BRAND_DARK2} 100%)`,
            flexShrink: 0,
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
