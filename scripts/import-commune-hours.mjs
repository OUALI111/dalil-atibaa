/**
 * import-commune-hours.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Importe commune + opening_hours depuis doctors_import.csv vers Supabase.
 *
 * Usage :
 *   node scripts/import-commune-hours.mjs
 *
 * Pré-requis :
 *   - Fichier doctors_import.csv à la racine du projet
 *   - Variable SUPABASE_SERVICE_ROLE_KEY dans .env.local
 *     (Supabase Dashboard → Settings → API → service_role key)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────────────────────────

// Lire .env.local manuellement (sans dotenv)
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
let supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL

try {
  const env = readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const [key, ...vals] = line.split('=')
    const val = vals.join('=').trim()
    if (key?.trim() === 'SUPABASE_SERVICE_ROLE_KEY') serviceRoleKey = val
    if (key?.trim() === 'NEXT_PUBLIC_SUPABASE_URL')  supabaseUrl    = val
  }
} catch (_) {}

if (!serviceRoleKey || !supabaseUrl) {
  console.error('❌ ERREUR : Ajoute dans .env.local :')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJhb...')
  console.error('   (Supabase → Settings → API → service_role)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
})

// ── Lecture CSV ───────────────────────────────────────────────────────────────

function parseCSV(content) {
  const lines  = content.split('\n').filter(l => l.trim())
  const header = lines[0].split(',')
  const rows   = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Parser CSV avec guillemets
    const cols = []
    let cur = '', inQuote = false
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === '"') {
        if (inQuote && line[j+1] === '"') { cur += '"'; j++ }
        else inQuote = !inQuote
      } else if (ch === ',' && !inQuote) {
        cols.push(cur); cur = ''
      } else {
        cur += ch
      }
    }
    cols.push(cur)

    const id           = parseInt(cols[0])
    const commune      = (cols[1] || '').trim()
    const openingHours = (cols[2] || '').trim()

    if (!isNaN(id) && id > 0) {
      rows.push({ id, commune, opening_hours: openingHours })
    }
  }
  return rows
}

// ── Import par batch ──────────────────────────────────────────────────────────

const BATCH_SIZE = 200

async function importData() {
  console.log('📂 Lecture du fichier doctors_import.csv...')
  const csv  = readFileSync('doctors_import.csv', 'utf8')
  const rows = parseCSV(csv)
  console.log(`✅ ${rows.length} médecins chargés depuis le CSV`)

  // Filtrer les lignes utiles (au moins commune ou horaires remplis)
  const toUpdate = rows.filter(r =>
    (r.commune && r.commune !== '') ||
    (r.opening_hours && r.opening_hours !== '' && r.opening_hours !== 'Non renseigné')
  )
  console.log(`📋 ${toUpdate.length} médecins à mettre à jour (avec commune et/ou horaires)`)

  // Nettoyer "Non renseigné" → null
  const cleaned = toUpdate.map(r => ({
    id:            r.id,
    commune:       r.commune || null,
    opening_hours: (r.opening_hours === 'Non renseigné' || !r.opening_hours)
                   ? null
                   : r.opening_hours,
    updated_at:    new Date().toISOString()
  }))

  // Import par batches
  const total   = cleaned.length
  let   success = 0
  let   errors  = 0

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch     = cleaned.slice(i, i + BATCH_SIZE)
    const batchNum  = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(total / BATCH_SIZE)

    process.stdout.write(`\r⏳ Batch ${batchNum}/${totalBatches} (${i + batch.length}/${total})...`)

    const { error } = await supabase
      .from('doctors')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`\n❌ Erreur batch ${batchNum}:`, error.message)
      errors += batch.length
    } else {
      success += batch.length
    }
  }

  console.log('\n')
  console.log('═══════════════════════════════════')
  console.log(`✅ Succès   : ${success} médecins mis à jour`)
  console.log(`❌ Erreurs  : ${errors}`)
  console.log('═══════════════════════════════════')

  // Vérification rapide
  const { data: sample } = await supabase
    .from('doctors')
    .select('id, name_fr, commune, opening_hours')
    .not('commune', 'is', null)
    .limit(3)

  console.log('\n📋 Vérification (3 premiers médecins avec commune) :')
  sample?.forEach(d => {
    console.log(`  ID ${d.id} — ${d.name_fr}`)
    console.log(`    Commune  : ${d.commune}`)
    console.log(`    Horaires : ${d.opening_hours?.substring(0, 80)}...`)
  })
}

importData().catch(err => {
  console.error('❌ Erreur fatale:', err.message)
  process.exit(1)
})
