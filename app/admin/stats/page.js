'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import {
  Phone,
  Eye,
  MessageCircle,
  MapPin,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Smartphone,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Sparkles,
  Compass,
  LogOut,
  Layers,
  Award,
  BarChart2
} from 'lucide-react'

// ─── Formateurs utilitaires ──────────────────────────────────────────────────
function fmt(num) {
  if (num === null || num === undefined) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toLocaleString('fr-FR')
}

function calcTrend(curr, prev) {
  if (!prev || prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 100)
}

function calcConvRate(calls, whatsapp, views) {
  if (!views || views === 0) return '0%'
  const totalActions = (calls || 0) + (whatsapp || 0)
  return ((totalActions / views) * 100).toFixed(1) + '%'
}

// ─── Composant Écran de Connexion Sécurisé ─────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        onLogin()
      } else {
        setError('Identifiants administrateur incorrects')
      }
    } catch {
      setError('Erreur de connexion serveur, veuillez réessayer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Halo décoratif d'arrière-plan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dalil Atibaa Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Console de pilotage & analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Identifiant
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin username"
              autoComplete="username"
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Accéder au Dashboard →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── StatCard Élégante ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtext, trend, color = 'blue' }) {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }[color] || 'bg-slate-800 text-slate-400 border-slate-700'

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white mt-1.5 tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtext && <span className="text-slate-500">{subtext}</span>}
        {trend !== undefined && trend !== null && (
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              trend > 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : trend < 0
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
            {trend > 0 ? `+${trend}%` : `${trend}%`} vs hier
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Dashboard Principal ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('direct') // 'direct' | 'roi' | 'opportunities'

  // Vérification cookie de session au chargement
  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => {
        if (res.ok) setIsAuth(true)
      })
      .catch(() => {})
      .finally(() => setAuthChecking(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/admin/check', { method: 'POST' }).catch(() => {})
    setIsAuth(false)
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!isAuth) {
    return <LoginScreen onLogin={() => setIsAuth(true)} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Général */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">Dalil Atibaa</span>
              <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation par Onglets */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'direct'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Direct (48h)</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'roi'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Valeur & ROI</span>
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'opportunities'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Opportunités</span>
            </button>
          </nav>

          {/* Actions Droite */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/404"
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              Gestion Redirections
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu de la Vue Active */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'direct' && <ViewDirect />}
        {activeTab === 'roi' && <ViewRoi />}
        {activeTab === 'opportunities' && <ViewOpportunities />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500">
        Dalil Atibaa — Système d'analytics sécurisé & optimisé
      </footer>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ⚡ VUE 1 : DIRECT 48H (LE POULS EN TEMPS RÉEL)
// ══════════════════════════════════════════════════════════════════════════════
function ViewDirect() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    today: { views: 0, calls: 0, whatsapp: 0, maps: 0 },
    yesterday: { views: 0, calls: 0, whatsapp: 0, maps: 0 },
    hourlyToday: Array(24).fill(0).map(() => ({ views: 0, calls: 0 })),
    topDoctorsToday: [],
    pwaStats: { standaloneToday: 0, totalRecent: 0, android: 0, ios: 0 },
  })

  const fetchDirectData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const startOfToday = new Date(now)
      startOfToday.setHours(0, 0, 0, 0)

      const startOfYesterday = new Date(startOfToday)
      startOfYesterday.setDate(startOfYesterday.getDate() - 1)

      // Récupérer les événements des 48 dernières heures depuis doctor_stats
      const { data: events, error } = await supabase
        .from('doctor_stats')
        .select('doctor_id, event_type, created_at')
        .gte('created_at', startOfYesterday.toISOString())

      if (error) throw error

      const todayCounts = { views: 0, calls: 0, whatsapp: 0, maps: 0 }
      const yesterdayCounts = { views: 0, calls: 0, whatsapp: 0, maps: 0 }
      const hourly = Array(24).fill(0).map(() => ({ views: 0, calls: 0 }))
      const doctorScores = {}

      const startOfTodayMs = startOfToday.getTime()

      events?.forEach((evt) => {
        const evtDate = new Date(evt.created_at)
        const evtMs = evtDate.getTime()
        const isToday = evtMs >= startOfTodayMs

        if (isToday) {
          if (evt.event_type === 'view') {
            todayCounts.views++
            hourly[evtDate.getHours()].views++
          } else if (evt.event_type === 'call_click') {
            todayCounts.calls++
            hourly[evtDate.getHours()].calls++
          } else if (evt.event_type === 'whatsapp_click') {
            todayCounts.whatsapp++
            hourly[evtDate.getHours()].calls++ // comptabilisé dans les contacts
          } else if (evt.event_type === 'map_click') {
            todayCounts.maps++
          }

          // Score médecin aujourd'hui (Appels comptent triple, WhatsApp double, vue simple)
          if (evt.doctor_id) {
            if (!doctorScores[evt.doctor_id]) {
              doctorScores[evt.doctor_id] = { id: evt.doctor_id, views: 0, calls: 0, whatsapp: 0, score: 0 }
            }
            if (evt.event_type === 'view') {
              doctorScores[evt.doctor_id].views++
              doctorScores[evt.doctor_id].score += 1
            } else if (evt.event_type === 'call_click') {
              doctorScores[evt.doctor_id].calls++
              doctorScores[evt.doctor_id].score += 4
            } else if (evt.event_type === 'whatsapp_click') {
              doctorScores[evt.doctor_id].whatsapp++
              doctorScores[evt.doctor_id].score += 3
            }
          }
        } else {
          if (evt.event_type === 'view') yesterdayCounts.views++
          else if (evt.event_type === 'call_click') yesterdayCounts.calls++
          else if (evt.event_type === 'whatsapp_click') yesterdayCounts.whatsapp++
          else if (evt.event_type === 'map_click') yesterdayCounts.maps++
        }
      })

      // Top 5 médecins aujourd'hui
      const topIds = Object.values(doctorScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      let topDoctorsDetailed = []
      if (topIds.length > 0) {
        const { data: docs } = await supabase
          .from('doctors')
          .select('id, name_fr, slug, specialties(name_fr), wilayas(name_fr)')
          .in('id', topIds.map((d) => d.id))

        const docMap = {}
        docs?.forEach((d) => { docMap[d.id] = d })

        topDoctorsDetailed = topIds.map((item) => ({
          ...item,
          doctor: docMap[item.id] || null,
        }))
      }

      // Stats PWA rapides (dernières 24-48h)
      const { data: pwaRows } = await supabase
        .from('pwa_stats')
        .select('event, platform, created_at')
        .gte('created_at', startOfToday.toISOString())

      let standaloneToday = 0
      let android = 0
      let ios = 0

      pwaRows?.forEach((r) => {
        if (r.event === 'session_standalone') standaloneToday++
        if (r.platform === 'android') android++
        if (r.platform === 'ios') ios++
      })

      setStats({
        today: todayCounts,
        yesterday: yesterdayCounts,
        hourlyToday: hourly,
        topDoctorsToday: topDoctorsDetailed,
        pwaStats: {
          standaloneToday,
          totalRecent: pwaRows?.length || 0,
          android,
          ios,
        },
      })
    } catch (err) {
      console.error('Erreur chargement Direct:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDirectData()
  }, [fetchDirectData])

  const convRateToday = calcConvRate(stats.today.calls, stats.today.whatsapp, stats.today.views)
  const convRateYesterday = calcConvRate(stats.yesterday.calls, stats.yesterday.whatsapp, stats.yesterday.views)

  return (
    <div className="space-y-6">
      {/* Barre de statut supérieure */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Activité en Direct — Aujourd'hui</h2>
            <p className="text-xs text-slate-400">Événements enregistrés au cours des dernières 48 heures</p>
          </div>
        </div>

        <button
          onClick={fetchDirectData}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Cartes Compteurs Aujourd'hui vs Hier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="Profils Consultés"
          value={fmt(stats.today.views)}
          subtext={`Hier: ${fmt(stats.yesterday.views)}`}
          trend={calcTrend(stats.today.views, stats.yesterday.views)}
          color="blue"
        />
        <StatCard
          icon={Phone}
          label="Appels Téléphoniques"
          value={fmt(stats.today.calls)}
          subtext={`Hier: ${fmt(stats.yesterday.calls)}`}
          trend={calcTrend(stats.today.calls, stats.yesterday.calls)}
          color="emerald"
        />
        <StatCard
          icon={MessageCircle}
          label="Clics WhatsApp"
          value={fmt(stats.today.whatsapp)}
          subtext={`Hier: ${fmt(stats.yesterday.whatsapp)}`}
          trend={calcTrend(stats.today.whatsapp, stats.yesterday.whatsapp)}
          color="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Taux de Contact Réel"
          value={convRateToday}
          subtext={`Hier: ${convRateYesterday}`}
          color="purple"
        />
      </div>

      {/* Graphique d'activité Heure par Heure + Top Praticiens du Jour */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique Heure par Heure */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Fréquentation Heure par Heure (Aujourd'hui)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Vues de fiches médicales par tranche horaire</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block" /> Vues
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" /> Appels
              </span>
            </div>
          </div>

          {/* Barres Horaires */}
          <div className="h-48 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 border-b border-slate-800">
            {stats.hourlyToday.map((item, idx) => {
              const maxViews = Math.max(...stats.hourlyToday.map((h) => h.views), 10)
              const heightPct = Math.round((item.views / maxViews) * 100)

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip au survol */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-slate-800 border border-slate-700 text-[11px] rounded-lg p-2 shadow-xl whitespace-nowrap text-center">
                      <p className="font-bold text-white">{idx}h00 - {idx + 1}h00</p>
                      <p className="text-blue-400">{item.views} vues</p>
                      <p className="text-emerald-400">{item.calls} contacts</p>
                    </div>
                    <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                  </div>

                  {/* Barre d'activité */}
                  <div
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      item.views > 0
                        ? 'bg-blue-600 group-hover:bg-blue-400'
                        : 'bg-slate-800/40'
                    }`}
                  />
                  <span className="text-[9px] text-slate-500 mt-1 font-mono">{idx % 3 === 0 ? `${idx}h` : ''}</span>
                </div>
              )
            })}
          </div>

          <p className="text-[11px] text-slate-500 mt-3 text-right">Heures locales algériennes (GMT+1)</p>
        </div>

        {/* Top 5 Praticiens du Jour */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Top 5 Médecins Demandés Aujourd'hui</h3>
          </div>

          {stats.topDoctorsToday.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-6 text-slate-500 text-xs">
              Aucune interaction enregistrée pour le moment aujourd'hui.
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {stats.topDoctorsToday.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <Link
                        href={`/docteur/${item.doctor?.slug || item.id}`}
                        target="_blank"
                        className="text-xs font-semibold text-white hover:text-blue-400 transition truncate block"
                      >
                        {item.doctor?.name_fr || `Médecin #${item.id}`}
                      </Link>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.doctor?.specialties?.name_fr || 'Médecin'} • {item.doctor?.wilayas?.name_fr || 'Algérie'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" title="Appels reçus">
                      📞 {item.calls}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium" title="Vues reçues">
                      👁 {item.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Widget PWA & Adoption Mobile */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Application PWA Installée</h4>
            <p className="text-xs text-slate-400">
              <strong className="text-white">{stats.pwaStats.standaloneToday} ouvertures</strong> en mode application autonome aujourd'hui
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            Plateformes : <strong className="text-slate-200">{stats.pwaStats.android} Android</strong> / <strong className="text-slate-200">{stats.pwaStats.ios} iOS</strong>
          </span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// 💎 VUE 2 : VALEUR & ROI MÉDECINS (HISTORIQUE CUMULÉ TOTAL)
// ══════════════════════════════════════════════════════════════════════════════
function ViewRoi() {
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totals, setTotals] = useState({ views: 0, calls: 0, whatsapp: 0, maps: 0 })

  // Filtres & Pagination
  const [search, setSearch] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [sortBy, setSortBy] = useState('count_calls') // 'count_calls' | 'count_views' | 'count_whatsapp'
  const [page, setPage] = useState(0)
  const pageSize = 20

  // Référentiels pour les listes déroulantes
  const [wilayasList, setWilayasList] = useState([])
  const [specialtiesList, setSpecialtiesList] = useState([])

  // Charger les référentiels une fois
  useEffect(() => {
    async function loadRefs() {
      const [{ data: w }, { data: s }] = await Promise.all([
        supabase.from('wilayas').select('id, name_fr').order('name_fr'),
        supabase.from('specialties').select('id, name_fr').order('name_fr'),
      ])
      setWilayasList(w || [])
      setSpecialtiesList(s || [])
    }
    loadRefs()
  }, [])

  // Charger les totaux généraux historiques une fois
  useEffect(() => {
    async function loadGrandTotals() {
      // Lit les agrégats depuis la table doctors pour les actifs ayant au moins une action
      const { data } = await supabase
        .from('doctors')
        .select('count_views, count_calls, count_whatsapp, count_maps')
        .or('count_views.gt.0,count_calls.gt.0,count_whatsapp.gt.0,count_maps.gt.0')

      if (data) {
        const sum = data.reduce(
          (acc, d) => ({
            views: acc.views + (d.count_views || 0),
            calls: acc.calls + (d.count_calls || 0),
            whatsapp: acc.whatsapp + (d.count_whatsapp || 0),
            maps: acc.maps + (d.count_maps || 0),
          }),
          { views: 0, calls: 0, whatsapp: 0, maps: 0 }
        )
        setTotals(sum)
      }
    }
    loadGrandTotals()
  }, [])

  // Charger les médecins paginés avec filtres
  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('doctors')
        .select(
          'id, name_fr, slug, phone, count_views, count_calls, count_whatsapp, count_maps, specialties(name_fr), wilayas(name_fr)',
          { count: 'exact' }
        )
        .eq('is_active', true)

      if (search.trim()) {
        query = query.ilike('name_fr', `%${search.trim()}%`)
      }
      if (selectedWilaya) {
        query = query.eq('wilaya_id', selectedWilaya)
      }
      if (selectedSpecialty) {
        query = query.eq('specialty_id', selectedSpecialty)
      }

      query = query
        .order(sortBy, { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      const { data, count, error } = await query

      if (error) throw error
      setDoctors(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Erreur chargement ROI:', err)
    } finally {
      setLoading(false)
    }
  }, [search, selectedWilaya, selectedSpecialty, sortBy, page])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  // Export CSV
  const handleExportCsv = () => {
    if (doctors.length === 0) return
    const headers = ['ID', 'Nom Médecin', 'Spécialité', 'Wilaya', 'Téléphone', 'Vues Totales', 'Appels Générés', 'WhatsApp', 'Taux Contact']
    const rows = doctors.map((d) => [
      d.id,
      `"${(d.name_fr || '').replace(/"/g, '""')}"`,
      `"${(d.specialties?.name_fr || '').replace(/"/g, '""')}"`,
      `"${(d.wilayas?.name_fr || '').replace(/"/g, '""')}"`,
      `"${d.phone || ''}"`,
      d.count_views || 0,
      d.count_calls || 0,
      d.count_whatsapp || 0,
      `"${calcConvRate(d.count_calls, d.count_whatsapp, d.count_views)}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `dalil_atibaa_roi_medecins_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* KPIs Historiques Globaux */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white">Impact & Valeur Commerciale Cumulée</h2>
          <p className="text-xs text-slate-400">Total des contacts et opportunités apportés aux praticiens depuis la création</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Appels Délivrés</p>
            <p className="text-2xl lg:text-3xl font-bold text-emerald-400 mt-1">📞 {fmt(totals.calls)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Mises en relation téléphoniques directes</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Délivrés</p>
            <p className="text-2xl lg:text-3xl font-bold text-emerald-400 mt-1">💬 {fmt(totals.whatsapp)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Échanges WhatsApp patients initiés</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultations Fiches</p>
            <p className="text-2xl lg:text-3xl font-bold text-blue-400 mt-1">👁 {fmt(totals.views)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Vues de profils de praticiens</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taux de Contact Moyen</p>
            <p className="text-2xl lg:text-3xl font-bold text-purple-400 mt-1">
              🎯 {calcConvRate(totals.calls, totals.whatsapp, totals.views)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Proportion de visiteurs qui contactent</p>
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Recherche par nom */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              placeholder="Rechercher un médecin par nom..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtre Wilaya */}
          <select
            value={selectedWilaya}
            onChange={(e) => {
              setSelectedWilaya(e.target.value)
              setPage(0)
            }}
            className="bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">Toutes les Wilayas</option>
            {wilayasList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name_fr}
              </option>
            ))}
          </select>

          {/* Filtre Spécialité */}
          <select
            value={selectedSpecialty}
            onChange={(e) => {
              setSelectedSpecialty(e.target.value)
              setPage(0)
            }}
            className="bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">Toutes les Spécialités</option>
            {specialtiesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_fr}
              </option>
            ))}
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(0)
            }}
            className="bg-slate-950 border border-slate-800 text-xs sm:text-sm text-blue-400 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="count_calls">Trier par Appels ↓</option>
            <option value="count_whatsapp">Trier par WhatsApp ↓</option>
            <option value="count_views">Trier par Vues ↓</option>
          </select>

          {/* Bouton Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <span>{totalCount.toLocaleString('fr-FR')} praticiens trouvés</span>
          {loading && <span className="text-blue-400 flex items-center gap-1">Chargement en cours...</span>}
        </div>
      </div>

      {/* Tableau des Médecins */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Médecin</th>
                <th className="py-3 px-4">Spécialité & Wilaya</th>
                <th className="py-3 px-4 text-center">Téléphone</th>
                <th className="py-3 px-4 text-right">Vues</th>
                <th className="py-3 px-4 text-right">Appels</th>
                <th className="py-3 px-4 text-right">WhatsApp</th>
                <th className="py-3 px-4 text-right">Taux Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {doctors.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Aucun médecin ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => {
                  const rate = calcConvRate(doc.count_calls, doc.count_whatsapp, doc.count_views)

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <Link
                          href={`/docteur/${doc.slug || doc.id}`}
                          target="_blank"
                          className="hover:text-blue-400 inline-flex items-center gap-1.5 transition"
                        >
                          <span>{doc.name_fr}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span>{doc.specialties?.name_fr || 'Médecin'}</span>
                        <span className="text-slate-500 mx-1.5">•</span>
                        <span className="text-slate-400">{doc.wilayas?.name_fr || 'Algérie'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-300">
                        {doc.phone ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{doc.phone}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-300">
                        {fmt(doc.count_views)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          📞 {fmt(doc.count_calls)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
                          💬 {fmt(doc.count_whatsapp)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-purple-400">
                        {rate}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page <strong className="text-white">{page + 1}</strong> sur <strong className="text-white">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg border border-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg border border-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// 🎯 VUE 3 : OPPORTUNITÉS & RECHERCHES (LE RADAR DES MANQUES)
// ══════════════════════════════════════════════════════════════════════════════
function ViewOpportunities() {
  const [loading, setLoading] = useState(true)
  const [searchStats, setSearchStats] = useState([])
  const [specialtiesMap, setSpecialtiesMap] = useState({})
  const [wilayasMap, setWilayasMap] = useState({})

  const fetchSearchStats = useCallback(async () => {
    setLoading(true)
    try {
      // Charger les référentiels
      const [{ data: s }, { data: w }, { data: searches }] = await Promise.all([
        supabase.from('specialties').select('id, name_fr'),
        supabase.from('wilayas').select('id, name_fr'),
        supabase
          .from('search_stats')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1500),
      ])

      const sMap = {}
      s?.forEach((item) => { sMap[item.id] = item.name_fr })
      const wMap = {}
      w?.forEach((item) => { wMap[item.id] = item.name_fr })

      setSpecialtiesMap(sMap)
      setWilayasMap(wMap)
      setSearchStats(searches || [])
    } catch (err) {
      console.error('Erreur chargement recherches:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSearchStats()
  }, [fetchSearchStats])

  // Analyses dérivées des recherches
  const analysis = useMemo(() => {
    let total = searchStats.length
    let zeroResults = 0
    let gpsCount = 0

    const zeroMap = {}
    const specialtyFreq = {}
    const wilayaFreq = {}

    searchStats.forEach((r) => {
      if (r.gps_used) gpsCount++

      if (r.results_count === 0) {
        zeroResults++
        // Clé d'identification du manque
        const specName = r.specialty_id ? specialtiesMap[r.specialty_id] : null
        const wilayaName = r.wilaya_id ? wilayasMap[r.wilaya_id] : null
        const term = r.query?.trim() || ''

        let label = ''
        if (term) label = `"${term}"`
        if (specName) label = label ? `${label} (${specName})` : specName
        if (wilayaName) label = label ? `${label} à ${wilayaName}` : `Wilaya: ${wilayaName}`

        if (!label) label = 'Recherche sans filtre'

        if (!zeroMap[label]) {
          zeroMap[label] = { label, count: 0, lastDate: r.created_at }
        }
        zeroMap[label].count++
      }

      if (r.specialty_id && specialtiesMap[r.specialty_id]) {
        const sName = specialtiesMap[r.specialty_id]
        specialtyFreq[sName] = (specialtyFreq[sName] || 0) + 1
      }

      if (r.wilaya_id && wilayasMap[r.wilaya_id]) {
        const wName = wilayasMap[r.wilaya_id]
        wilayaFreq[wName] = (wilayaFreq[wName] || 0) + 1
      }
    })

    const topZeros = Object.values(zeroMap).sort((a, b) => b.count - a.count)
    const topSpecialties = Object.entries(specialtyFreq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    const topWilayas = Object.entries(wilayaFreq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    return {
      total,
      zeroResults,
      gpsPercent: total > 0 ? Math.round((gpsCount / total) * 100) : 0,
      topZeros,
      topSpecialties,
      topWilayas,
    }
  }, [searchStats, specialtiesMap, wilayasMap])

  return (
    <div className="space-y-6">
      {/* Introduction Opportunités */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Radar des Recherches & Besoins Non Couverts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprenez ce que les patients recherchent pour orienter l'import et le référencement de nouveaux médecins
          </p>
        </div>

        <button
          onClick={fetchSearchStats}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Rafraîchir</span>
        </button>
      </div>

      {/* Cartes KPI Demande */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Search}
          label="Total Recherches Analysées"
          value={fmt(analysis.total)}
          subtext="Volume de requêtes utilisateurs"
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          label="Recherches Sans Résultat"
          value={fmt(analysis.zeroResults)}
          subtext="Besoins de patients non satisfaits"
          color="amber"
        />
        <StatCard
          icon={MapPin}
          label="Part Recherche GPS"
          value={`${analysis.gpsPercent}%`}
          subtext="Recherches 'Autour de moi'"
          color="emerald"
        />
      </div>

      {/* Section Prioritaire : Le Radar des Manques (0 résultat) */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Le Radar des Manques (0 Résultat Trouvé)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ces requêtes ont renvoyé 0 médecin. Ce sont vos opportunités d'enrichissement prioritaires.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {analysis.topZeros.length} manques identifiés
          </span>
        </div>

        {analysis.topZeros.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            🎉 Aucune recherche infructueuse enregistrée récemment !
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Recherche Non Comblée</th>
                  <th className="py-2.5 px-3 text-center">Nombre de Demandes</th>
                  <th className="py-2.5 px-3 text-right">Dernière Tentative</th>
                  <th className="py-2.5 px-3 text-right">Action Suggérée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analysis.topZeros.slice(0, 15).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      {item.label}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {item.count} fois
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 text-xs font-mono">
                      {item.lastDate ? new Date(item.lastDate).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[11px] text-blue-400 font-medium hover:underline cursor-pointer">
                        Ajouter praticiens →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Spécialités et Top Wilayas Demandées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spécialités */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Spécialités les Plus Recherchées</h3>
          </div>

          <div className="space-y-3">
            {analysis.topSpecialties.map((item, idx) => {
              const maxVal = analysis.topSpecialties[0]?.count || 1
              const pct = Math.round((item.count / maxVal) * 100)

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <span className="text-slate-400 font-bold">{item.count} recherches</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Wilayas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Wilayas les Plus Actives en Recherche</h3>
          </div>

          <div className="space-y-3">
            {analysis.topWilayas.map((item, idx) => {
              const maxVal = analysis.topWilayas[0]?.count || 1
              const pct = Math.round((item.count / maxVal) * 100)

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <span className="text-slate-400 font-bold">{item.count} recherches</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
