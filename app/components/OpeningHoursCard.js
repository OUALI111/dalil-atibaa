'use client'

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

const TRANSLATIONS = {
  fr: {
    days: {
      dimanche: 'Dimanche', lundi: 'Lundi', mardi: 'Mardi',
      mercredi: 'Mercredi', jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi',
    },
    openNow:        'Ouvert maintenant',
    closedNow:      'Fermé actuellement',
    closed:         'Fermé',
    title:          "Horaires d'ouverture",
    titlePartial:   'Horaires indicatifs',
    callToConfirm:  'Appelez pour confirmer',
  },
  ar: {
    days: {
      dimanche: 'الأحد', lundi: 'الاثنين', mardi: 'الثلاثاء',
      mercredi: 'الأربعاء', jeudi: 'الخميس', vendredi: 'الجمعة', samedi: 'السبت',
    },
    openNow:        'مفتوح الآن',
    closedNow:      'مغلق حالياً',
    closed:         'مغلق',
    title:          'مواعيد العمل',
    titlePartial:   'مواعيد تقريبية',
    callToConfirm:  'اتصل للتأكيد',
  },
}

function parseFullWeek(str) {
  return str.split(' | ').map(entry => {
    const [day, hours] = entry.split(': ')
    return { day: day?.trim(), hours: hours?.trim() || 'Fermé' }
  })
}

function parseTimeRange(hours) {
  const match = hours?.match(/(\d{2}:\d{2})[–\-](\d{2}:\d{2})/)
  if (!match) return null
  return { open: match[1], close: match[2] }
}

function checkIsOpenNow(days) {
  try {
    const now = new Date()
    const algeriaStr = now.toLocaleString('en-US', { timeZone: 'Africa/Algiers' })
    const algeria = new Date(algeriaStr)
    const todayName = DAYS_FR[algeria.getDay()]
    const todayEntry = days.find(d => d.day === todayName)
    if (!todayEntry || todayEntry.hours === 'Fermé') return false
    const range = parseTimeRange(todayEntry.hours)
    if (!range) return false
    const [openH, openM] = range.open.split(':').map(Number)
    const [closeH, closeM] = range.close.split(':').map(Number)
    const current = algeria.getHours() * 60 + algeria.getMinutes()
    const open    = openH * 60 + openM
    let   close   = closeH * 60 + closeM
    if (close < open) close += 24 * 60
    return current >= open && current < close
  } catch { return false }
}

function getTodayName() {
  try {
    const now = new Date()
    const algeriaStr = now.toLocaleString('en-US', { timeZone: 'Africa/Algiers' })
    return DAYS_FR[new Date(algeriaStr).getDay()]
  } catch { return '' }
}

export default function OpeningHoursCard({ openingHours, lang = 'fr' }) {
  if (!openingHours) return null

  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr
  const isFullWeek = openingHours.includes(' | ')

  // ── CAS 1 : Horaires 7 jours complets ──────────────────────────────────────
  if (isFullWeek) {
    const days      = parseFullWeek(openingHours)
    const isOpenNow = checkIsOpenNow(days)
    const todayName = getTodayName()

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.title}
          </h2>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
            isOpenNow
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            {isOpenNow ? t.openNow : t.closedNow}
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {days.map(({ day, hours }) => {
            const isToday  = day === todayName
            const isClosed = hours === 'Fermé'
            const range    = parseTimeRange(hours)
            const label    = t.days[day] || day

            return (
              <div
                key={day}
                className={`flex items-center justify-between py-2.5 ${
                  isToday ? 'font-semibold' : ''
                }`}
              >
                <span className={`text-sm ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                  {isToday && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mb-0.5" />
                  )}
                  {label}
                </span>
                {isClosed ? (
                  <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                    {t.closed}
                  </span>
                ) : range ? (
                  <span className={`text-sm tabular-nums ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                    {range.open} – {range.close}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">{hours}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── CAS 2 : Horaire partiel (1 seul jour scrappé) ─────────────────────────
  const range = parseTimeRange(openingHours)
  if (!range) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t.titlePartial}
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-800 tabular-nums">
          {range.open} – {range.close}
        </span>
        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
          {t.callToConfirm}
        </span>
      </div>
    </div>
  )
}
