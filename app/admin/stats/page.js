'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const ADMIN_USERNAME = 'LEADMAGNUS'
const ADMIN_PASSWORD = 'GALAXTICOS2025'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── helpers ─────────────────────────────────────────────────────────────────
function getPeriodRange(period) {
  const now = new Date()
  const start = new Date(now)
  
  if (period === 'today') {
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }
  if (period === 'yesterday') {
    start.setDate(now.getDate() - 1)
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }
  if (period === '7d')  start.setDate(now.getDate() - 7)
  if (period === '15d') start.setDate(now.getDate() - 15)
  if (period === '30d') start.setDate(now.getDate() - 30)
  if (period === '90d') start.setDate(now.getDate() - 90)
  if (period === 'all') return null
  return start.toISOString()
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n
}

function convRate(views, calls) {
  if (!views) return '0%'
  return Math.round((calls / views) * 100) + '%'
}

// ─── calcTrend : retourne le delta % entre current et prev ───────────────────
function calcTrend(current, prev) {
  if (prev === null || prev === undefined) return null
  if (prev === 0) return current > 0 ? 100 : null
  return Math.round(((current - prev) / prev) * 100)
}

// ─── getPrevPeriodRange : plage de la période précédente ─────────────────────
function getPrevPeriodRange(period) {
  const now = new Date()
  if (period === 'all') return { since: null, until: null, skip: true }

  if (period === 'today') {
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0)
    const startYest  = new Date(startToday); startYest.setDate(startYest.getDate() - 1)
    return { since: startYest.toISOString(), until: startToday.toISOString() }
  }
  if (period === 'yesterday') {
    const startYest     = new Date(now); startYest.setDate(now.getDate() - 1); startYest.setHours(0,0,0,0)
    const startDayBefore = new Date(startYest); startDayBefore.setDate(startDayBefore.getDate() - 1)
    return { since: startDayBefore.toISOString(), until: startYest.toISOString() }
  }
  const daysMap = { '7d': 7, '15d': 15, '30d': 30, '90d': 90 }
  const d = daysMap[period]
  if (d) {
    const until = new Date(now); until.setDate(until.getDate() - d)
    const since = new Date(until); since.setDate(since.getDate() - d)
    return { since: since.toISOString(), until: until.toISOString() }
  }
  return { since: null, until: null, skip: true }
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub, trend }) {
  const trendEl = trend !== null && trend !== undefined ? (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 ${
      trend > 0  ? 'bg-green-50 text-green-600' :
      trend < 0  ? 'bg-red-50   text-red-500'   :
                   'bg-gray-50  text-gray-400'
    }`}>
      {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {trend > 0 ? '+' : ''}{trend}% vs période préc.
    </span>
  ) : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 transition hover:shadow-md">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {trendEl}
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── MiniBar ─────────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
      />
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setErr('Identifiants incorrects')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div style={{ backgroundColor: 'rgba(26, 135, 216, 0.2)', borderColor: 'rgba(26, 135, 216, 0.3)' }} className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
          <p style={{ color: '#e8f4fc' }} className="text-sm mt-1">Dalil Atibaa — Admin</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            value={u} onChange={e => setU(e.target.value)}
            placeholder="Identifiant"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition"
          />
          <input
            type="password"
            value={p} onChange={e => setP(e.target.value)}
            placeholder="Mot de passe"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition"
          />
          {err && <p className="text-red-300 text-sm text-center">{err}</p>}
          <button
            type="submit"
            style={{ backgroundColor: '#1E293B' }}
            className="w-full hover:opacity-90 text-white py-3 rounded-xl font-semibold transition shadow-lg"
          >
            Accéder →
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StatsDashboard() {
  const [isAuth, setIsAuth] = useState(false)
  const [period, setPeriod] = useState('30d')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('views')
  const [loading, setLoading] = useState(false)
  const [rawStats, setRawStats] = useState([])
  const [doctors, setDoctors] = useState({})
  const [totals, setTotals]       = useState({ views: 0, calls: 0, whatsapp: 0, maps: 0 })
  const [prevTotals, setPrevTotals] = useState(null)   // période précédente pour calcul tendance
  const [chartData, setChartData]  = useState([])
  const [hoveredBar, setHoveredBar] = useState(null) // index de la colonne survolée (tooltip)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize]       = useState(10)
  const [topDoctorToday, setTopDoctorToday] = useState(null)  // médecin le + vu aujourd'hui
  const [inactiveCount,   setInactiveCount]  = useState(null)  // médecins actifs sans aucune vue
  const [pwaData,         setPwaData]         = useState(null)  // événements PWA bruts

  // ── fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuth) return
    fetchData()
  }, [isAuth, period])

  // Réinitialiser la page courante lors du changement des filtres ou de recherche
  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy, period])

  // Médecin du jour + alertes + PWA — chargés une fois à la connexion admin
  useEffect(() => {
    if (!isAuth) return
    fetchTopDoctorToday()
    fetchInactiveCount()
    fetchPwaStats()
  }, [isAuth])


  // ── fetchTopDoctorToday : médecin avec le + de vues aujourd'hui ────────────
  async function fetchTopDoctorToday() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('doctor_stats')
      .select('doctor_id')
      .eq('event_type', 'view')
      .gte('created_at', todayStart.toISOString())

    if (!data || data.length === 0) { setTopDoctorToday(null); return }

    // Agrège les vues par médecin côté client
    const counts = {}
    data.forEach(r => { counts[r.doctor_id] = (counts[r.doctor_id] || 0) + 1 })
    const [topId, viewsToday] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

    const { data: doc } = await supabase
      .from('doctors')
      .select('id, name_fr, slug, specialties(name_fr), wilayas(name_fr)')
      .eq('id', Number(topId))
      .single()

    if (doc) setTopDoctorToday({ ...doc, viewsToday })
    else     setTopDoctorToday(null)
  }

  // ── fetchInactiveCount : médecins actifs sans aucune vue enregistrée ─────────────────
  async function fetchInactiveCount() {
    // Une seule requête COUNT côté Supabase — très efficace
    const { count } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('count_views', 0)
    setInactiveCount(count || 0)
  }

  // ── fetchPwaStats : événements PWA depuis la table pwa_stats ──────────────────────
  async function fetchPwaStats() {
    const { data } = await supabase
      .from('pwa_stats')
      .select('event, platform, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
    setPwaData(data || [])
  }

  // ── Helper : lit doctor_stats en entier par boucles de 1000 (contourne la limite Supabase) ─
  async function fetchStatsWithPagination(since, until) {

    const allStats = []
    let from = 0
    const batchSize = 1000
    let fetched = 0
    do {
      let query = supabase
        .from('doctor_stats')
        .select('doctor_id, event_type, created_at')
        .range(from, from + batchSize - 1)
      if (since) {
        if (until) {
          query = query.gte('created_at', since).lte('created_at', until)
        } else {
          query = query.gte('created_at', since)
        }
      }
      const { data, error } = await query
      if (error) break
      fetched = (data || []).length
      allStats.push(...(data || []))
      from += batchSize
    } while (fetched === batchSize)
    return allStats
  }

  // ── Helper : 4 COUNT queries parallèles pour la période précédente (très efficace) ─
  async function fetchPrevTotals(since, until) {
    const countFor = async (eventType) => {
      let q = supabase
        .from('doctor_stats')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', eventType)
      if (since) q = q.gte('created_at', since)
      if (until) q = q.lt('created_at', until)
      const { count } = await q
      return count || 0
    }
    const [views, calls, whatsapp, maps] = await Promise.all([
      countFor('view'),
      countFor('call_click'),
      countFor('whatsapp_click'),
      countFor('map_click'),
    ])
    return { views, calls, whatsapp, maps }
  }

  // ── fetch data ──────────────────────────────────────────────────────────────
  async function fetchData() {
    setLoading(true)
    try {
      // Lance la récupération de la période précédente EN PARALLÈLE dès le début
      const prevRange = getPrevPeriodRange(period)
      const prevPromise = prevRange.skip
        ? Promise.resolve(null)
        : fetchPrevTotals(prevRange.since, prevRange.until)

      if (period === 'all') {
        // ════════════════════════════════════════════════════════════════════
        // MODE "TOUT" : lecture des compteurs agrégés count_* depuis doctors
        // Filtre côté serveur (actifs seulement) + pagination pour dépasser
        // la limite 1000 de Supabase (6684 médecins dans la DB, 1887 actifs)
        // ════════════════════════════════════════════════════════════════════
        const activeDocs = []
        let fromDocs = 0
        const batchDocs = 1000
        let fetchedDocs = 0
        do {
          const { data: batch, error: batchErr } = await supabase
            .from('doctors')
            .select('id, name_fr, slug, count_views, count_calls, count_whatsapp, count_maps, specialties(name_fr), wilayas(name_fr)')
            .or('count_views.gt.0,count_calls.gt.0,count_whatsapp.gt.0,count_maps.gt.0')
            .range(fromDocs, fromDocs + batchDocs - 1)
          if (batchErr) break
          fetchedDocs = (batch || []).length
          activeDocs.push(...(batch || []))
          fromDocs += batchDocs
        } while (fetchedDocs === batchDocs)

        const doctorMap = {}
        activeDocs.forEach(d => { doctorMap[d.id] = d })
        setDoctors(doctorMap)

        const rawStatsData = activeDocs.map(d => ({
          id: d.id,
          views:    d.count_views    || 0,
          calls:    d.count_calls    || 0,
          whatsapp: d.count_whatsapp || 0,
          maps:     d.count_maps     || 0,
        }))
        setRawStats(rawStatsData)

        // Totaux globaux
        setTotals({
          views:    rawStatsData.reduce((s, r) => s + r.views, 0),
          calls:    rawStatsData.reduce((s, r) => s + r.calls, 0),
          whatsapp: rawStatsData.reduce((s, r) => s + r.whatsapp, 0),
          maps:     rawStatsData.reduce((s, r) => s + r.maps, 0),
        })

        // Graphique : événements récents dans doctor_stats (nouvelles visites non encore rollupées)
        const recentStats = await fetchStatsWithPagination(null, null)
        const dailyCounts = {}
        for (const s of recentStats) {
          const day = s.created_at.slice(0, 10)
          if (!dailyCounts[day]) dailyCounts[day] = { views: 0, calls: 0, whatsapp: 0 }
          if (s.event_type === 'view')            dailyCounts[day].views++
          if (s.event_type === 'call_click')      dailyCounts[day].calls++
          if (s.event_type === 'whatsapp_click')  dailyCounts[day].whatsapp++
        }
        const days = Object.keys(dailyCounts).sort().slice(-14)
        setChartData(days.map(d => ({ day: d.slice(5), views: dailyCounts[d].views, calls: dailyCounts[d].calls, whatsapp: dailyCounts[d].whatsapp })))

      } else {
        // ════════════════════════════════════════════════════════════════════
        // MODE PÉRIODE SPÉCIFIQUE : lecture complète de doctor_stats avec pagination
        // → lit toutes les lignes par boucles de 1000, sans jamais perdre de données
        // ════════════════════════════════════════════════════════════════════
        let since = getPeriodRange(period)
        let until = null

        if (period === 'yesterday') {
          const startOfYesterday = new Date()
          startOfYesterday.setDate(startOfYesterday.getDate() - 1)
          startOfYesterday.setHours(0, 0, 0, 0)
          since = startOfYesterday.toISOString()
          const endOfYesterday = new Date()
          endOfYesterday.setDate(endOfYesterday.getDate() - 1)
          endOfYesterday.setHours(23, 59, 59, 999)
          until = endOfYesterday.toISOString()
        }

        const stats = await fetchStatsWithPagination(since, until)

        // Récupère les infos médecins pour les IDs trouvés
        const ids = [...new Set(stats.map(s => s.doctor_id))].filter(Boolean)
        let doctorMap = {}
        if (ids.length > 0) {
          const { data: docs } = await supabase
            .from('doctors')
            .select('id, name_fr, slug, count_views, count_calls, count_whatsapp, count_maps, specialties(name_fr), wilayas(name_fr)')
            .in('id', ids)
          ;(docs || []).forEach(d => { doctorMap[d.id] = d })
        }
        setDoctors(doctorMap)

        // Agrège par médecin
        const agg = {}
        const dailyCounts = {}
        for (const s of stats) {
          if (!agg[s.doctor_id]) agg[s.doctor_id] = { views: 0, calls: 0, whatsapp: 0, maps: 0 }
          if (s.event_type === 'view')           agg[s.doctor_id].views++
          if (s.event_type === 'call_click')     agg[s.doctor_id].calls++
          if (s.event_type === 'whatsapp_click') agg[s.doctor_id].whatsapp++
          if (s.event_type === 'map_click')      agg[s.doctor_id].maps++
          const day = s.created_at.slice(0, 10)
          if (!dailyCounts[day]) dailyCounts[day] = { views: 0, calls: 0, whatsapp: 0 }
          if (s.event_type === 'view')            dailyCounts[day].views++
          if (s.event_type === 'call_click')      dailyCounts[day].calls++
          if (s.event_type === 'whatsapp_click')  dailyCounts[day].whatsapp++
        }

        setRawStats(Object.entries(agg).map(([id, v]) => ({ id: Number(id), ...v })))
        setTotals({
          views:    Object.values(agg).reduce((s, r) => s + r.views, 0),
          calls:    Object.values(agg).reduce((s, r) => s + r.calls, 0),
          whatsapp: Object.values(agg).reduce((s, r) => s + r.whatsapp, 0),
          maps:     Object.values(agg).reduce((s, r) => s + r.maps, 0),
        })
        const days = Object.keys(dailyCounts).sort().slice(-14)
        setChartData(days.map(d => ({ day: d.slice(5), views: dailyCounts[d].views, calls: dailyCounts[d].calls, whatsapp: dailyCounts[d].whatsapp })))
      }

      // Attend la période précédente et met à jour le state
      const prev = await prevPromise
      setPrevTotals(prev)

    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  // Fonction d'exportation des données de la table sous format CSV
  function exportCsv() {
    if (rows.length === 0) return
    
    // En-têtes du fichier CSV
    const headers = ['Nom', 'Specialite', 'Wilaya', 'Vues', 'Appels', 'WhatsApp', 'Carte', 'Taux de conversion']
    
    // Contenu des lignes
    const csvRows = rows.map(r => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.specialty.replace(/"/g, '""')}"`,
      `"${r.wilaya.replace(/"/g, '""')}"`,
      r.views,
      r.calls,
      r.whatsapp,
      r.maps,
      `"${convRate(r.views, r.calls)}"`
    ])
    
    // Jointure finale avec saut de ligne
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n')
    
    // Création du fichier téléchargeable
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `stats_medecins_${period}_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ── filtered + sorted rows ──────────────────────────────────────────────────
  const rows = useMemo(() => {
    let list = rawStats
      .filter(r => !!doctors[r.id]) // Exclut les médecins qui ont été supprimés de la base
      .map(r => ({
        ...r,
        doctor: doctors[r.id],
        name: doctors[r.id]?.name_fr || `#${r.id}`,
        specialty: doctors[r.id]?.specialties?.name_fr || '—',
        wilaya: doctors[r.id]?.wilayas?.name_fr || '—',
        slug: doctors[r.id]?.slug || '',
        globalViews: doctors[r.id]?.count_views || 0,
      }))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q) ||
        r.wilaya.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => b[sortBy] - a[sortBy])
    return list
  }, [rawStats, doctors, search, sortBy])

  // Pagination Logic
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return rows.slice(startIndex, startIndex + pageSize)
  }, [rows, currentPage, pageSize])

  const totalPages = Math.ceil(rows.length / pageSize)

  const maxViews = useMemo(() => Math.max(...rows.map(r => r.views), 1), [rows])
  const maxCalls = useMemo(() => Math.max(...rows.map(r => r.calls), 1), [rows])

  // ── chart max ────────────────────────────────────────────────────────────────
  // chartMax inclut les 3 séries pour un axe Y cohérent
  const chartMax = useMemo(() => Math.max(...chartData.map(d => Math.max(d.views, d.calls, d.whatsapp || 0)), 1), [chartData])

  // ── PWA stats calculées depuis pwaData ────────────────────────────────────────────
  const pwaStats = useMemo(() => {
    if (!pwaData) return null
    const count = (evt) => pwaData.filter(r => r.event === evt).length
    const bannerShown      = count('banner_shown')
    const installClicked   = count('install_clicked')
    const installAccepted  = count('install_accepted')
    const installDismissed = count('install_dismissed')
    const sessionPWA       = count('session_standalone')
    const android = pwaData.filter(r => r.platform === 'android').length
    const ios     = pwaData.filter(r => r.platform === 'ios').length
    const platformTotal   = android + ios || 1
    const androidPct = Math.round((android / platformTotal) * 100)
    const iosPct     = 100 - androidPct
    const refusalRate = bannerShown ? Math.round((installDismissed / bannerShown) * 100) : 0
    const installRate = bannerShown ? Math.round((installAccepted  / bannerShown) * 100) : 0
    // Graphique installations quotidiennes (30 derniers jours)
    const since30 = new Date(); since30.setDate(since30.getDate() - 30)
    const byDay = {}
    pwaData
      .filter(r => r.event === 'install_accepted' && new Date(r.created_at) >= since30)
      .forEach(r => { const d = r.created_at.slice(5, 10); byDay[d] = (byDay[d] || 0) + 1 })
    const dailyInstalls = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, cnt]) => ({ day, cnt }))
    return { bannerShown, installClicked, installAccepted, installDismissed, sessionPWA, android, ios, androidPct, iosPct, refusalRate, installRate, dailyInstalls }
  }, [pwaData])

  // Conversion Globale
  const totalInteractions = totals.calls + totals.whatsapp + totals.maps
  const globalConvRate = totals.views > 0 ? Math.round((totalInteractions / totals.views) * 100) : 0

  // C1 — Top 10 Wilayas avec médecins actifs + taux de conversion
  const topWilayas = useMemo(() => {
    const stats = {}
    rows.forEach(r => {
      if (r.wilaya && r.wilaya !== '—') {
        if (!stats[r.wilaya]) stats[r.wilaya] = { views: 0, interactions: 0, doctors: 0 }
        stats[r.wilaya].views        += r.views
        stats[r.wilaya].interactions += (r.calls || 0) + (r.whatsapp || 0) + (r.maps || 0)
        stats[r.wilaya].doctors      += 1
      }
    })
    return Object.entries(stats)
      .map(([name, s]) => ({
        name,
        views:    s.views,
        doctors:  s.doctors,
        convRate: s.views > 0 ? Math.round((s.interactions / s.views) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }, [rows])

  // C2 — Top 10 Spécialités avec taux de conversion
  const topSpecialties = useMemo(() => {
    const stats = {}
    rows.forEach(r => {
      if (r.specialty && r.specialty !== '—') {
        if (!stats[r.specialty]) stats[r.specialty] = { views: 0, interactions: 0, doctors: 0 }
        stats[r.specialty].views        += r.views
        stats[r.specialty].interactions += (r.calls || 0) + (r.whatsapp || 0) + (r.maps || 0)
        stats[r.specialty].doctors      += 1
      }
    })
    return Object.entries(stats)
      .map(([name, s]) => ({
        name,
        views:    s.views,
        doctors:  s.doctors,
        convRate: s.views > 0 ? Math.round((s.interactions / s.views) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }, [rows])

  if (!isAuth) return <LoginScreen onLogin={() => setIsAuth(true)} />

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-none">Statistiques</h1>
              <p className="text-xs text-gray-400">Dalil Atibaa — Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Period selector */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap">
              {[
                ['today', "Aujourd'hui"],
                ['yesterday', 'Hier'],
                ['7d', '7 jours'],
                ['15d', '15 jours'],
                ['30d', '1 mois'],
                ['90d', '3 mois'],
                ['all', 'Tout']
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setPeriod(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    period === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition"
            >
              <span className={loading ? 'animate-spin' : ''}>↻</span>
              Actualiser
            </button>

            <a href="/admin/404" className="text-sm text-gray-400 hover:text-blue-600 transition px-2">
              Admin →
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👁" label="Visites" value={fmtNum(totals.views)}
            color="bg-blue-50 text-blue-600"
            trend={prevTotals ? calcTrend(totals.views, prevTotals.views) : null}
            sub={
              period === 'all'
                ? 'Toutes périodes'
                : period === 'today'
                ? "Aujourd'hui"
                : period === 'yesterday'
                ? 'Hier'
                : period === '15d'
                ? 'Ces 15 derniers jours'
                : `Ces ${period === '7d' ? '7' : period === '30d' ? '30' : '90'} derniers jours`
            }
          />
          <StatCard icon="📞" label="Clics Appel" value={fmtNum(totals.calls)}
            color="bg-green-50 text-green-600"
            trend={prevTotals ? calcTrend(totals.calls, prevTotals.calls) : null}
            sub={`Taux: ${convRate(totals.views, totals.calls)}`}
          />
          <StatCard icon="💬" label="Clics WhatsApp" value={fmtNum(totals.whatsapp)}
            color="bg-emerald-50 text-emerald-600"
            trend={prevTotals ? calcTrend(totals.whatsapp, prevTotals.whatsapp) : null}
            sub={`Taux: ${convRate(totals.views, totals.whatsapp)}`}
          />
          <StatCard icon="🗺" label="Clics Carte" value={fmtNum(totals.maps)}
            color="bg-orange-50 text-orange-600"
            trend={prevTotals ? calcTrend(totals.maps, prevTotals.maps) : null}
            sub={`Taux: ${convRate(totals.views, totals.maps)}`}
          />
        </div>

        {/* ── Médecin du jour ───────────────────────────────────────────────── */}
        {topDoctorToday && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between gap-4 flex-wrap shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl font-extrabold shrink-0">
                {topDoctorToday.name_fr?.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-blue-100 font-semibold uppercase tracking-widest mb-0.5">
                  ⭐ Médecin du jour
                </p>
                <p className="font-bold text-lg leading-tight">{topDoctorToday.name_fr}</p>
                <p className="text-blue-100 text-sm mt-0.5">
                  {topDoctorToday.specialties?.name_fr}
                  {topDoctorToday.wilayas?.name_fr ? ` · ${topDoctorToday.wilayas.name_fr}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-4xl font-extrabold tabular-nums">{topDoctorToday.viewsToday}</p>
                <p className="text-xs text-blue-100 mt-0.5">vues aujourd'hui</p>
              </div>
              <a
                href={`/docteur/${topDoctorToday.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                Voir la fiche →
              </a>
            </div>
          </div>
        )}

        {/* ── Alerte médecins inactifs ────────────────────────────────────────────── */}
        {inactiveCount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg shrink-0">
                ⚠️
              </div>
              <div>
                <p className="font-bold text-orange-800">
                  {inactiveCount} médecin{inactiveCount > 1 ? 's' : ''} sans aucune visite
                </p>
                <p className="text-sm text-orange-600">
                  Ces profils sont actifs mais n'ont jamais été visités. Pensez à compléter leurs fiches.
                </p>
              </div>
            </div>
            <a
              href="/admin/404"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition whitespace-nowrap"
            >
              Gérer les fiches →
            </a>
          </div>
        )}

        {/* Performance & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-1 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-yellow-500">⚡</span> Performance Globale
              </h2>
              <p className="text-sm text-gray-500 mb-4">Ratio total des interactions (Appel, WhatsApp, Map) par rapport aux visites uniques.</p>
              
              <div className="flex items-center justify-center py-6">
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
                    <circle cx="64" cy="64" r="54" stroke="#3b82f6" strokeWidth="10" fill="transparent" 
                      strokeDasharray={339.3}
                      strokeDashoffset={339.3 - (339.3 * Math.min(globalConvRate, 100)) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-gray-900">{globalConvRate}%</span>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Conversion</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-50 pt-4 mt-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total visites : <b>{totals.views}</b></span>
                <span>Interactions : <b>{totalInteractions}</b></span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-blue-600">📈</span>
              Évolution 14 jours — Visites · Appels · WhatsApp
            </h2>
            {chartData.length > 0 ? (
              <>
                {/* Colonnes de barres */}
                <div className="flex items-end gap-1.5 h-40 pb-2 overflow-x-auto">
                  {chartData.map((d, i) => {
                    const hMax = chartMax || 1
                    const hViews    = Math.max(hMax ? (d.views / hMax) * 100 : 0, d.views > 0 ? 4 : 0)
                    const hCalls    = Math.max(hMax ? (d.calls / hMax) * 100 : 0, d.calls > 0 ? 4 : 0)
                    const hWhatsapp = Math.max(hMax ? ((d.whatsapp || 0) / hMax) * 100 : 0, (d.whatsapp || 0) > 0 ? 4 : 0)
                    return (
                      <div
                        key={i}
                        className="relative flex flex-col items-center gap-0.5 flex-1 min-w-[26px] cursor-default"
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Tooltip */}
                        {hoveredBar === i && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap z-20 shadow-xl pointer-events-none">
                            <p className="font-bold text-gray-300 mb-1 text-center">{d.day}</p>
                            <p className="text-blue-300">👁 {d.views} vues</p>
                            <p className="text-green-300">📞 {d.calls} appels</p>
                            <p className="text-purple-300">💬 {d.whatsapp || 0} WhatsApp</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        )}
                        {/* Barres empilées */}
                        <div className="w-full flex flex-col items-center justify-end h-28 gap-px">
                          <div className="w-full rounded-t-sm bg-purple-400 transition-all duration-500"
                            style={{ height: `${hWhatsapp}px` }} />
                          <div className="w-full bg-green-400 transition-all duration-500"
                            style={{ height: `${hCalls}px` }} />
                          <div className="w-full rounded-b-sm bg-blue-500 transition-all duration-500"
                            style={{ height: `${hViews}px` }} />
                        </div>
                        <span className={`text-[9px] whitespace-nowrap transition-colors ${
                          hoveredBar === i ? 'text-gray-700 font-semibold' : 'text-gray-400'
                        }`}>{d.day}</span>
                      </div>
                    )
                  })}
                </div>
                {/* Légende */}
                <div className="flex items-center gap-5 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" /> Visites
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-sm bg-green-400" /> Appels
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-sm bg-purple-400" /> WhatsApp
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Pas assez de données pour afficher le graphique d'évolution quotidien
              </div>
            )}
          </div>
        </div>

        {/* Top 10 Wilayas & Spécialités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Wilayas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-blue-500">📍</span> Top 10 Wilayas
              </span>
              <span className="text-xs text-gray-400 font-normal">vues · médecins · conversion</span>
            </h2>
            {topWilayas.length > 0 ? (
              <div className="space-y-2.5">
                {topWilayas.map((w, idx) => {
                  const maxVal = topWilayas[0].views || 1
                  const barPct = Math.round((w.views / maxVal) * 100)
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 truncate max-w-[140px]">
                          <span className="text-gray-400 mr-1">{idx + 1}.</span>{w.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                            👨‍⚕️ {w.doctors}
                          </span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                            w.convRate >= 10 ? 'bg-green-50 text-green-600' :
                            w.convRate >= 5  ? 'bg-blue-50  text-blue-500'  :
                                               'bg-gray-50  text-gray-400'
                          }`}>
                            {w.convRate}%
                          </span>
                          <span className="font-semibold text-gray-800 w-16 text-right">{fmtNum(w.views)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Aucune donnée disponible</p>
            )}
          </div>

          {/* Top Spécialités */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-indigo-500">🩺</span> Top 10 Spécialités
              </span>
              <span className="text-xs text-gray-400 font-normal">vues · médecins · conversion</span>
            </h2>
            {topSpecialties.length > 0 ? (
              <div className="space-y-2.5">
                {topSpecialties.map((s, idx) => {
                  const maxVal = topSpecialties[0].views || 1
                  const barPct = Math.round((s.views / maxVal) * 100)
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 truncate max-w-[140px]">
                          <span className="text-gray-400 mr-1">{idx + 1}.</span>{s.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                            👨‍⚕️ {s.doctors}
                          </span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                            s.convRate >= 10 ? 'bg-green-50 text-green-600' :
                            s.convRate >= 5  ? 'bg-indigo-50 text-indigo-500' :
                                               'bg-gray-50  text-gray-400'
                          }`}>
                            {s.convRate}%
                          </span>
                          <span className="font-semibold text-gray-800 w-16 text-right">{fmtNum(s.views)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-700"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* ── SECTION PWA ───────────────────────────────────────────────────────────── */}
        {pwaStats && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

            {/* En-tête */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <span>📱</span> Statistiques PWA &amp; Installation
              </h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {pwaStats.bannerShown} événements total
              </span>
            </div>

            {/* B2 — Funnel d'installation */}
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Entonnoir d'installation</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: '📢', label: 'Banner affiché', value: pwaStats.bannerShown,      pct: null,    color: 'text-gray-400 bg-gray-50' },
                  { icon: '👆', label: 'Clic Installer',  value: pwaStats.installClicked,  pct: pwaStats.bannerShown     ? Math.round((pwaStats.installClicked  / pwaStats.bannerShown)     * 100) : 0, color: 'text-blue-600 bg-blue-50'   },
                  { icon: '✅',    label: 'Installés',      value: pwaStats.installAccepted, pct: pwaStats.installClicked  ? Math.round((pwaStats.installAccepted / pwaStats.installClicked) * 100) : 0, color: 'text-green-600 bg-green-50' },
                  { icon: '📱',    label: 'Sessions PWA',  value: pwaStats.sessionPWA,      pct: pwaStats.installAccepted ? Math.round((pwaStats.sessionPWA       / pwaStats.installAccepted) * 100) : 0, color: 'text-purple-600 bg-purple-50' },
                ].map(({ icon, label, value, pct, color }, i) => (
                  <div key={i} className="relative">
                    {i < 3 && (
                      <span className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-gray-300 font-black text-lg">›</span>
                    )}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <p className="text-2xl mb-2">{icon}</p>
                      <p className="text-2xl font-extrabold text-gray-900">{fmtNum(value)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      {pct !== null && (
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 ${color}`}>
                          {pct}% de passage
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B3 — KPIs PWA + Plateforme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* KPIs */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">KPIs clés</p>
                {[
                  { label: 'Taux d’installation', value: `${pwaStats.installRate}%`,   sub: `${pwaStats.installAccepted} installés / ${pwaStats.bannerShown} banners`,  bar: pwaStats.installRate,   color: 'bg-green-500' },
                  { label: 'Taux de refus',        value: `${pwaStats.refusalRate}%`,  sub: `${pwaStats.installDismissed} refus / ${pwaStats.bannerShown} banners`,      bar: pwaStats.refusalRate,   color: 'bg-red-400'   },
                  { label: 'Sessions PWA totales', value: fmtNum(pwaStats.sessionPWA), sub: 'Ouvertures depuis l’app installée',                                        bar: pwaStats.sessionPWA > 0 ? Math.min(Math.round((pwaStats.sessionPWA / Math.max(pwaStats.installAccepted, 1)) * 100), 100) : 0, color: 'bg-purple-500' },
                ].map(({ label, value, sub, bar, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="font-bold text-gray-900">{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${Math.min(bar, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Plateforme Android vs iOS */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Plateforme</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  {[
                    { icon: '🤖', label: 'Android', pct: pwaStats.androidPct, count: pwaStats.android, color: 'bg-green-500' },
                    { icon: '🍎', label: 'iOS',     pct: pwaStats.iosPct,     count: pwaStats.ios,     color: 'bg-gray-400'  },
                  ].map(({ icon, label, pct, count, color }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{icon} {label}</span>
                        <span className="text-sm font-bold text-gray-900">{pct}% <span className="text-xs text-gray-400">({fmtNum(count)})</span></span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`${color} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* B4 — Graphique installations par jour (30 jours) */}
            {pwaStats.dailyInstalls.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  📅 Installations par jour (30 derniers jours)
                </p>
                <div className="flex items-end gap-1 h-20">
                  {(() => {
                    const maxInst = Math.max(...pwaStats.dailyInstalls.map(d => d.cnt), 1)
                    return pwaStats.dailyInstalls.map(({ day, cnt }, i) => {
                      const h = Math.max((cnt / maxInst) * 60, cnt > 0 ? 4 : 0)
                      return (
                        <div key={i} className="relative flex flex-col items-center gap-0.5 flex-1 min-w-[16px] group">
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-lg px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
                            {cnt} install{cnt > 1 ? 's' : ''}
                          </div>
                          <div className="w-full bg-green-400 rounded-t-sm transition-all duration-500" style={{ height: `${h}px` }} />
                          <span className="text-[8px] text-gray-400">{day}</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}

          </div>
        )}

        {/* SUGGESTIONS D'AMÉLIORATION DU DASHBOARD */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-start gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h3 className="font-bold text-lg">Suggestions pour aller plus loin avec votre Dashboard :</h3>
              <ul className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-100">
                <li className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <b className="text-white block mb-1">🗺 Top 5 Wilayas & Spécialités</b>
                  Découvrez instantanément quelles régions et quels types de médecins génèrent le plus d'activité.
                </li>
                <li className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <b className="text-white block mb-1">📥 Export CSV / Excel</b>
                  Téléchargez la liste filtrée des statistiques en un clic pour vos rapports personnels.
                </li>
                <li className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <b className="text-white block mb-1">🤖 Détecteur de Bots (Spider)</b>
                  Filtrez les faux clics générés par les robots d'indexation pour des données 100% réelles.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="p-5 border-b border-gray-50 flex items-center gap-3 flex-wrap justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="text-blue-600">🏥</span>
              Par médecin
              {rows.length > 0 && (
                <span className="text-sm font-normal text-gray-400 ml-1">({rows.length} médecins)</span>
              )}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Page size selector */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <span>Afficher</span>
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-xl text-sm px-2 py-1.5 focus:outline-none focus:border-blue-400 text-gray-700 font-medium"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 w-48"
                />
              </div>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:border-blue-400 text-gray-700"
              >
                <option value="views">↓ Visites</option>
                <option value="calls">↓ Appels</option>
                <option value="whatsapp">↓ WhatsApp</option>
                <option value="maps">↓ Carte</option>
              </select>

              {/* Export CSV Button */}
              <button
                onClick={exportCsv}
                disabled={rows.length === 0}
                style={{ backgroundColor: '#1E293B' }}
                className="flex items-center gap-1.5 hover:opacity-90 text-white text-sm px-3.5 py-2 rounded-xl font-medium transition disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>📥</span> Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
              <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Chargement des données...
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium">Aucune donnée pour cette période</p>
              <p className="text-sm mt-1">Les visites s'enregistreront automatiquement</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-semibold">#</th>
                      <th className="text-left px-3 py-3 font-semibold">Médecin</th>
                      <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Spécialité</th>
                      <th className="text-left px-3 py-3 font-semibold hidden lg:table-cell">Wilaya</th>
                      <th className="text-right px-3 py-3 font-semibold">
                        <button onClick={() => setSortBy('views')} className={`hover:text-blue-600 transition ${sortBy === 'views' ? 'text-blue-600' : ''}`}>
                          👁 Vues
                        </button>
                      </th>
                      <th className="text-right px-3 py-3 font-semibold">
                        <button onClick={() => setSortBy('calls')} className={`hover:text-green-600 transition ${sortBy === 'calls' ? 'text-green-600' : ''}`}>
                          📞 Appels
                        </button>
                      </th>
                      <th className="text-right px-3 py-3 font-semibold hidden sm:table-cell">
                        <button onClick={() => setSortBy('whatsapp')} className={`hover:text-emerald-600 transition ${sortBy === 'whatsapp' ? 'text-emerald-600' : ''}`}>
                          💬 WA
                        </button>
                      </th>
                      <th className="text-right px-3 py-3 font-semibold hidden sm:table-cell">
                        <button onClick={() => setSortBy('maps')} className={`hover:text-orange-600 transition ${sortBy === 'maps' ? 'text-orange-600' : ''}`}>
                          🗺 Carte
                        </button>
                      </th>
                      <th className="text-right px-5 py-3 font-semibold">Taux</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedRows.map((r, i) => {
                      const rankIndex = (currentPage - 1) * pageSize + i + 1;
                      return (
                        <tr key={r.id} className="hover:bg-blue-50/40 transition group">
                          <td className="px-5 py-4 text-sm text-gray-400 font-medium">{rankIndex}</td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {r.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <a
                                  href={`/docteur/${r.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition truncate block max-w-[160px]"
                                >
                                  {r.name}
                                </a>
                                <p className="text-xs text-gray-400 md:hidden">{r.specialty}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 hidden md:table-cell">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100 font-medium">
                              {r.specialty}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 hidden lg:table-cell">{r.wilaya}</td>
                          <td className="px-3 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`font-bold text-sm ${sortBy === 'views' ? 'text-blue-600' : 'text-gray-800'}`}>
                                {fmtNum(r.views)}
                              </span>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded-sm mt-0.5" title="Total cumulé historique">
                                Cumul: {fmtNum(r.globalViews)}
                              </span>
                            </div>
                            <MiniBar value={r.views} max={maxViews} color="bg-blue-400" />
                          </td>
                          <td className="px-3 py-4 text-right">
                            <span className={`font-bold text-sm ${sortBy === 'calls' ? 'text-green-600' : 'text-gray-800'}`}>
                              {fmtNum(r.calls)}
                            </span>
                            <MiniBar value={r.calls} max={maxCalls} color="bg-green-400" />
                          </td>
                          <td className="px-3 py-4 text-right text-sm font-semibold text-gray-700 hidden sm:table-cell">
                            {fmtNum(r.whatsapp)}
                          </td>
                          <td className="px-3 py-4 text-right text-sm font-semibold text-gray-700 hidden sm:table-cell">
                            {fmtNum(r.maps)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${
                              Number(convRate(r.views, r.calls).replace('%','')) >= 20
                                ? 'bg-green-100 text-green-700'
                                : Number(convRate(r.views, r.calls).replace('%','')) >= 10
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {convRate(r.views, r.calls)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION NAVIGATION */}
              {totalPages > 1 && (
                <div className="p-5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-3 bg-gray-50/50">
                  <span className="text-sm text-gray-500">
                    Affichage de <b>{(currentPage - 1) * pageSize + 1}</b> à <b>{Math.min(currentPage * pageSize, rows.length)}</b> sur <b>{rows.length}</b> médecins
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:pointer-events-none"
                    >
                      ← Précédent
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, i, arr) => {
                        const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                        return (
                          <div key={p} className="flex items-center gap-1">
                            {showEllipsis && <span className="text-gray-400 text-sm px-1">...</span>}
                            <button
                              onClick={() => setCurrentPage(p)}
                              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                                currentPage === p
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        )
                      })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Dalil Atibaa — Dashboard Statistiques · Données en temps réel
        </p>
      </div>
    </div>
  )
}
