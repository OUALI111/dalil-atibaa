/**
 * schemaSpecialties.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mapping slug spécialité → valeur officielle Schema.org MedicalSpecialty.
 *
 * Pourquoi ce fichier :
 *   Schema.org n'accepte pas du texte libre pour le champ `medicalSpecialty`.
 *   Il faut une URL d'énumération valide (ex: http://schema.org/Gynecologic).
 *   Sans ça, le validator Schema.org signale 1 ERREUR et la fiche n'est pas
 *   éligible aux Rich Results Google.
 *
 * Utilisation :
 *   import { getSchemaSpecialty } from '@/lib/schemaSpecialties'
 *   medicalSpecialty: getSchemaSpecialty(doctor.specialties?.slug)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SPECIALTY_MAP = {
  // Médecine générale
  'generaliste':               'http://schema.org/GeneralPractice',
  'medecin-generaliste':       'http://schema.org/GeneralPractice',

  // Cardiologie
  'cardiologue':               'http://schema.org/Cardiovascular',
  'cardiologie':               'http://schema.org/Cardiovascular',

  // Gynécologie / Obstétrique
  'gynecologue':               'http://schema.org/Gynecologic',
  'gynecologie':               'http://schema.org/Gynecologic',
  'gynecologue-obstetricien':  'http://schema.org/Gynecologic',

  // Pédiatrie
  'pediatre':                  'http://schema.org/Pediatric',
  'pediatrie':                 'http://schema.org/Pediatric',

  // Dentisterie
  'dentiste':                  'http://schema.org/Dentistry',
  'chirurgien-dentiste':       'http://schema.org/Dentistry',
  'orthodontiste':             'http://schema.org/Dentistry',

  // Dermatologie
  'dermatologue':              'http://schema.org/Dermatology',
  'dermatologie':              'http://schema.org/Dermatology',

  // Gastroentérologie
  'gastro-enterologue':        'http://schema.org/Gastroenterologic',
  'gastroenterologue':         'http://schema.org/Gastroenterologic',

  // Ophtalmologie
  'ophtalmologue':             'http://schema.org/Ophthalmologic',
  'ophtalmologie':             'http://schema.org/Ophthalmologic',

  // Neurologie / Psychiatrie
  'neurologue':                'http://schema.org/Neurological',
  'neurologie':                'http://schema.org/Neurological',
  'psychiatre':                'http://schema.org/Psychiatric',
  'psychiatrie':               'http://schema.org/Psychiatric',
  'psychologue':               'http://schema.org/Psychiatric',

  // Radiologie
  'radiologue':                'http://schema.org/Radiography',
  'radiologie':                'http://schema.org/Radiography',

  // Chirurgie
  'chirurgien':                'http://schema.org/PlasticSurgery',
  'chirurgie-generale':        'http://schema.org/PlasticSurgery',
  'chirurgie-orthopedique':    'http://schema.org/Musculoskeletal',
  'orthopediste':              'http://schema.org/Musculoskeletal',
  'orthopedie':                'http://schema.org/Musculoskeletal',

  // Urologie
  'urologue':                  'http://schema.org/Urologic',
  'urologie':                  'http://schema.org/Urologic',

  // Pneumologie
  'pneumologue':               'http://schema.org/Pulmonary',
  'pneumologie':               'http://schema.org/Pulmonary',

  // Endocrinologie
  'endocrinologue':            'http://schema.org/Endocrine',
  'endocrinologie':            'http://schema.org/Endocrine',

  // Rhumatologie
  'rhumatologue':              'http://schema.org/Rheumatologic',
  'rhumatologie':              'http://schema.org/Rheumatologic',

  // Oncologie
  'oncologue':                 'http://schema.org/Oncologic',
  'oncologie':                 'http://schema.org/Oncologic',

  // Hématologie
  'hematologue':               'http://schema.org/Hematologic',
  'hematologie':               'http://schema.org/Hematologic',

  // Maladies infectieuses
  'infectiologue':             'http://schema.org/Infectious',

  // Anesthésiologie
  'anesthesiste':              'http://schema.org/Anesthesia',
  'anesthesiologie':           'http://schema.org/Anesthesia',

  // ORL
  'orl':                       'http://schema.org/Otolaryngologic',
  'oto-rhino-laryngologiste':  'http://schema.org/Otolaryngologic',

  // Néphrologie
  'nephrologue':               'http://schema.org/Renal',
  'nephrologie':               'http://schema.org/Renal',

  // Nutrition / Diététique
  'nutritionniste':            'http://schema.org/DietNutrition',
  'dieteticien':               'http://schema.org/DietNutrition',

  // Urgences / Médecine d'urgence
  'urgentiste':                'http://schema.org/Emergency',
  'medecine-urgence':          'http://schema.org/Emergency',
}

/**
 * Retourne la valeur Schema.org officielle pour une spécialité.
 * @param {string|undefined} slug - Le slug de la spécialité (ex: "gynecologue")
 * @returns {string|undefined} URL Schema.org ou undefined si non mappé
 */
export function getSchemaSpecialty(slug) {
  if (!slug) return undefined
  return SPECIALTY_MAP[slug.toLowerCase()] ?? undefined
}
