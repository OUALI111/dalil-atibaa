/**
 * ✅ Bug #21 fix : Table de mapping genre grammatical pour les spécialités médicales
 *
 * Problème de l'ancienne heuristique :
 *   .includes('e') → "Généraliste" contient 'e' → "une Généraliste" ❌
 *   .includes('e') → "Cardiologue" contient 'e' → "une Cardiologue" ❌
 *   .includes('e') → "Dentiste" contient 'e' → "une Dentiste" (ça marche, mais par chance)
 *
 * Solution : mapping explicite basé sur la réalité grammaticale française.
 * Fallback : "un" (article masculin par défaut, le plus fréquent en médecine).
 *
 * Usage :
 *   getArticle('Gynécologue')     → 'une'
 *   getArticle('Cardiologue')     → 'un'
 *   getArticle('Sage-femme')      → 'une'
 *   getArticle('InconnuMédical')  → 'un'  (fallback sûr)
 */

/** Ensemble des spécialités au genre féminin */
const SPECIALITES_FEMININES = new Set([
  // Spécialités dont le praticien est grammaticalement féminin en français
  'gynécologue',
  'gynécologue obstétricien',
  'sage-femme',
  'sage femme',
  'infirmière',
  'puéricultrice',
  'diététicienne',
  'dieteticienne',
  'psychologue',          // les deux genres, mais "une" est plus courant
  'orthophoniste',        // idem
  'ergothérapeute',
  'ergotherapeute',
])

/**
 * Retourne l'article indéfini correct (un/une) pour une spécialité médicale.
 * @param {string|null|undefined} specialtyName - Nom de la spécialité (ex: "Gynécologue")
 * @returns {'un'|'une'} - Article grammaticalement correct
 */
export function getArticle(specialtyName) {
  if (!specialtyName) return 'un'
  const normalized = specialtyName.toLowerCase().trim()
  return SPECIALITES_FEMININES.has(normalized) ? 'une' : 'un'
}
