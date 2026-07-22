/**
 * Script de génération des icônes PWA pour Dalil Atibaa
 * Utilise sharp pour convertir le SVG source en PNG aux tailles requises
 * 
 * Usage : node scripts/generate-icons.js
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// SVG source de l'icône (carré bleu + croix médicale + point vert)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fond bleu -->
  <rect width="512" height="512" rx="80" fill="#1A87D8"/>
  <!-- Croix médicale blanche -->
  <rect x="196" y="116" width="120" height="280" rx="24" fill="white"/>
  <rect x="116" y="196" width="280" height="120" rx="24" fill="white"/>
  <!-- Point vert vitalité -->
  <circle cx="370" cy="142" r="52" fill="#22C55E"/>
  <circle cx="370" cy="142" r="32" fill="#16a34a"/>
</svg>`

// SVG maskable : plus de padding (zone de sécurité Android)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fond bleu plein (sans border-radius pour maskable) -->
  <rect width="512" height="512" fill="#1A87D8"/>
  <!-- Croix médicale (plus petite pour respecter la safe zone 80%) -->
  <rect x="216" y="146" width="80" height="220" rx="16" fill="white"/>
  <rect x="146" y="216" width="220" height="80" rx="16" fill="white"/>
  <!-- Point vert (dans la safe zone) -->
  <circle cx="346" cy="166" r="36" fill="#22C55E"/>
  <circle cx="346" cy="166" r="22" fill="#16a34a"/>
</svg>`

const outputDir = path.join(__dirname, '..', 'public', 'icons')

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA Dalil Atibaa...\n')

  const icons = [
    { name: 'icon-192x192.png', size: 192, svg: iconSvg },
    { name: 'icon-512x512.png', size: 512, svg: iconSvg },
    { name: 'icon-maskable-512x512.png', size: 512, svg: maskableSvg },
    { name: 'apple-touch-icon.png', size: 180, svg: iconSvg },
  ]

  for (const icon of icons) {
    await sharp(Buffer.from(icon.svg))
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(outputDir, icon.name))
    console.log(`  ✅ ${icon.name} (${icon.size}×${icon.size}px)`)
  }

  console.log('\n🚀 Toutes les icônes sont générées dans /public/icons/')
}

generateIcons().catch(console.error)
