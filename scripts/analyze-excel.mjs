import { readFileSync } from 'fs'
import { read, utils } from 'xlsx'

const wb = read(readFileSync('doctors_enrichis.xlsx'))
console.log('Feuilles:', wb.SheetNames)
const ws = wb.Sheets[wb.SheetNames[0]]
const data = utils.sheet_to_json(ws, { defval: null })

console.log('Nombre de lignes:', data.length)
console.log('Colonnes:', JSON.stringify(Object.keys(data[0])))
console.log('')

// Stats remplissage par colonne
const cols = Object.keys(data[0])
cols.forEach(col => {
  const nonNull = data.filter(r => r[col] !== null && r[col] !== '').length
  console.log(col + ': ' + nonNull + '/' + data.length + ' remplis')
})

console.log('')
console.log('=== 3 premiers enregistrements ===')
data.slice(0, 3).forEach((row, i) => {
  console.log('--- Ligne ' + (i+1) + ' ---')
  Object.entries(row).forEach(([k,v]) => {
    if(v !== null && v !== '') console.log('  ' + k + ': ' + String(v).substring(0, 200))
  })
})

// Exemple format Horaires
console.log('\n=== Exemples Horaires ===')
data.filter(r => r['Horaires']).slice(0, 5).forEach(r => {
  console.log('  ID ' + r['ID'] + ': ' + r['Horaires'])
})

// Exemple format Avis
console.log('\n=== Exemples Avis (brut) ===')
data.filter(r => r['Avis']).slice(0, 3).forEach(r => {
  console.log('  ID ' + r['ID'] + ': ' + String(r['Avis']).substring(0, 300))
})
