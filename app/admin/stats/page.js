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
  if (period === '7d')  start.setDate(now.getDate() - 7)
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
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4`}>
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

  // ── fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuth) return
    fetchData()
  }, [isAuth, period])

  async function fetchData() {
    setLoading(true)
    try {
      const since = getPeriodRange(period)

      // 1. fetch all stats in one query
      let query = supabase
        .from('doctor_stats')
        .select('doctor_id, event_type, created_at')
      if (since) query = query.gte('created_at', since)

      const { data: stats, error } = await query
      if (error) throw error

      // 2. fetch doctors info for matching ids
      const ids = [...new Set((stats || []).map(s => s.doctor_id))]
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

  // ── filtered + sorted rows ──────────────────────────────────────────────────
  const rows = useMemo(() => {
    let list = rawStats.map(r => ({
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

  const maxViews = useMemo(() => Math.max(...rows.map(r => r.views), 1), [rows])
  const maxCalls = useMemo(() => Math.max(...rows.map(r => r.calls), 1), [rows])

  // ── chart max ────────────────────────────────────────────────────────────────
  const chartMax = useMemo(() => Math.max(...chartData.map(d => d.views), 1), [chartData])

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
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {[['7d','7 jours'],['30d','30 jours'],['90d','3 mois'],['all','Tout']].map(([v, l]) => (
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
            sub={period === 'all' ? 'Toutes périodes' : `Ces ${period === '7d' ? '7' : period === '30d' ? '30' : '90'} derniers jours`}
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

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-blue-600">📈</span>
              Évolution des visites (14 derniers jours)
            </h2>
            <div className="flex items-end gap-2 h-32 overflow-x-auto pb-2">
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[28px]">
                  <div className="w-full flex flex-col items-center justify-end h-24 gap-0.5">
                    {/* calls bar */}
                    <div
                      className="w-full rounded-sm bg-green-400 transition-all duration-500"
                      style={{ height: `${Math.max(chartMax ? (d.calls / chartMax) * 60 : 0, d.calls > 0 ? 4 : 0)}px` }}
                      title={`${d.calls} appels`}
                    />
                    {/* views bar */}
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
          </div>
        )}

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
                  {rows.map((r, i) => (
                    <tr key={r.id} className="hover:bg-blue-50/40 transition group">
                      <td className="px-5 py-4 text-sm text-gray-400 font-medium">{i + 1}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
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
