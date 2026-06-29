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

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 transition hover:shadow-md`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
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
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
          <p className="text-blue-200 text-sm mt-1">Dalil Atibaa — Admin</p>
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-900/40"
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
  const [totals, setTotals] = useState({ views: 0, calls: 0, whatsapp: 0, maps: 0 })
  const [chartData, setChartData] = useState([])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // ── fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuth) return
    fetchData()
  }, [isAuth, period])

  // Réinitialiser la page courante lors du changement des filtres ou de recherche
  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy, period])

  async function fetchData() {
    setLoading(true)
    try {
      let since = getPeriodRange(period)
      let until = null

      if (period === 'yesterday') {
        const startOfYesterday = new Date()
        startOfYesterday.setDate(startOfYesterday.getDate() - 1)
        startOfYesterday.setHours(0,0,0,0)
        since = startOfYesterday.toISOString()

        const endOfYesterday = new Date()
        endOfYesterday.setDate(endOfYesterday.getDate() - 1)
        endOfYesterday.setHours(23,59,59,999)
        until = endOfYesterday.toISOString()
      }

      // 1. fetch all stats in one query
      let query = supabase
        .from('doctor_stats')
        .select('doctor_id, event_type, created_at')
        .order('created_at', { ascending: false })
        .limit(15000) // Augmente la limite pour éviter la troncature sur les longues périodes
      
      if (since) {
        if (until) {
          query = query.gte('created_at', since).lte('created_at', until)
        } else {
          query = query.gte('created_at', since)
        }
      }

      const { data: stats, error } = await query
      if (error) throw error

      // 2. fetch doctors info for matching ids
      const ids = [...new Set((stats || []).map(s => s.doctor_id))].filter(Boolean)
      let doctorMap = {}
      if (ids.length > 0) {
        const { data: docs } = await supabase
          .from('doctors')
          .select('id, name_fr, slug, specialties(name_fr), wilayas(name_fr)')
          .in('id', ids)
        if (docs) {
          docs.forEach(d => { doctorMap[d.id] = d })
        }
      }
      setDoctors(doctorMap)

      // 3. aggregate per doctor
      const agg = {}
      const dailyCounts = {}

      for (const s of (stats || [])) {
        if (!agg[s.doctor_id]) {
          agg[s.doctor_id] = { views: 0, calls: 0, whatsapp: 0, maps: 0 }
        }
        if (s.event_type === 'view')            agg[s.doctor_id].views++
        if (s.event_type === 'call_click')      agg[s.doctor_id].calls++
        if (s.event_type === 'whatsapp_click')  agg[s.doctor_id].whatsapp++
        if (s.event_type === 'map_click')       agg[s.doctor_id].maps++

        // daily chart
        const day = s.created_at.slice(0, 10)
        if (!dailyCounts[day]) dailyCounts[day] = { views: 0, calls: 0 }
        if (s.event_type === 'view')       dailyCounts[day].views++
        if (s.event_type === 'call_click') dailyCounts[day].calls++
      }

      setRawStats(Object.entries(agg).map(([id, v]) => ({ id: Number(id), ...v })))

      // 4. totals
      const tv = (stats || []).filter(s => s.event_type === 'view').length
      const tc = (stats || []).filter(s => s.event_type === 'call_click').length
      const tw = (stats || []).filter(s => s.event_type === 'whatsapp_click').length
      const tm = (stats || []).filter(s => s.event_type === 'map_click').length
      setTotals({ views: tv, calls: tc, whatsapp: tw, maps: tm })

      // 5. chart — last 14 days sorted
      const days = Object.keys(dailyCounts).sort().slice(-14)
      setChartData(days.map(d => ({ day: d.slice(5), views: dailyCounts[d].views, calls: dailyCounts[d].calls })))

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
  const chartMax = useMemo(() => Math.max(...chartData.map(d => d.views), 1), [chartData])

  // Conversion Globale
  const totalInteractions = totals.calls + totals.whatsapp + totals.maps
  const globalConvRate = totals.views > 0 ? Math.round((totalInteractions / totals.views) * 100) : 0

  // Top 5 Wilayas (triées par visites)
  const topWilayas = useMemo(() => {
    const counts = {}
    rows.forEach(r => {
      if (r.wilaya && r.wilaya !== '—') {
        counts[r.wilaya] = (counts[r.wilaya] || 0) + r.views
      }
    })
    return Object.entries(counts)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [rows])

  // Top 5 Spécialités (triées par visites)
  const topSpecialties = useMemo(() => {
    const counts = {}
    rows.forEach(r => {
      if (r.specialty && r.specialty !== '—') {
        counts[r.specialty] = (counts[r.specialty] || 0) + r.views
      }
    })
    return Object.entries(counts)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
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
            sub={`Taux: ${convRate(totals.views, totals.calls)}`}
          />
          <StatCard icon="💬" label="Clics WhatsApp" value={fmtNum(totals.whatsapp)}
            color="bg-emerald-50 text-emerald-600"
            sub={`Taux: ${convRate(totals.views, totals.whatsapp)}`}
          />
          <StatCard icon="🗺" label="Clics Carte" value={fmtNum(totals.maps)}
            color="bg-orange-50 text-orange-600"
            sub={`Taux: ${convRate(totals.views, totals.maps)}`}
          />
        </div>

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
              Évolution des visites (14 derniers jours)
            </h2>
            {chartData.length > 0 ? (
              <>
                <div className="flex items-end gap-2 h-36 overflow-x-auto pb-2">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[28px]">
                      <div className="w-full flex flex-col items-center justify-end h-24 gap-0.5">
                        <div
                          className="w-full rounded-sm bg-green-400 transition-all duration-500"
                          style={{ height: `${Math.max(chartMax ? (d.calls / chartMax) * 60 : 0, d.calls > 0 ? 4 : 0)}px` }}
                          title={`${d.calls} appels`}
                        />
                        <div
                          className="w-full rounded-sm bg-blue-500 transition-all duration-500"
                          style={{ height: `${Math.max(chartMax ? (d.views / chartMax) * 60 : 0, d.views > 0 ? 4 : 0)}px` }}
                          title={`${d.views} vues`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" /> Visites
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-sm bg-green-400" /> Appels
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-36 text-gray-400 text-sm">
                Pas assez de données pour afficher le graphique d'évolution quotidien
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Wilayas & Spécialités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Wilayas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">📍</span> Top 5 Wilayas les plus visitées
            </h2>
            {topWilayas.length > 0 ? (
              <div className="space-y-3">
                {topWilayas.map((w, idx) => {
                  const maxVal = topWilayas[0].views || 1;
                  const pct = Math.round((w.views / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{idx + 1}. {w.name}</span>
                        <span className="font-semibold text-gray-900">{w.views} vues</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Aucune donnée disponible</p>
            )}
          </div>

          {/* Top Spécialités */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-indigo-500">🩺</span> Top 5 Spécialités les plus visitées
            </h2>
            {topSpecialties.length > 0 ? (
              <div className="space-y-3">
                {topSpecialties.map((s, idx) => {
                  const maxVal = topSpecialties[0].views || 1;
                  const pct = Math.round((s.views / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{idx + 1}. {s.name}</span>
                        <span className="font-semibold text-gray-900">{s.views} vues</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Aucune donnée disponible</p>
            )}
          </div>
        </div>

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
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-sm px-3.5 py-2 rounded-xl font-medium transition disabled:opacity-50 disabled:pointer-events-none"
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
                            <span className={`font-bold text-sm ${sortBy === 'views' ? 'text-blue-600' : 'text-gray-800'}`}>
                              {fmtNum(r.views)}
                            </span>
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
