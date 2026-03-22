'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'GALAXTICOS2025'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(false)

  const [stats, setStats] = useState(null)
  const [recentDoctors, setRecentDoctors] = useState([])
  const [problemDoctors, setProblemDoctors] = useState({
    noPhone: [],
    noAddress: [],
    noGPS: [],
    duplicateSlugs: [],
  })
  const [logs404, setLogs404] = useState([])

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadAllData()
    }
  }, [])

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      loadAllData()
    } else {
      setError('Mot de passe incorrect')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
    setStats(null)
  }

  async function loadAllData() {
    setLoading(true)
    await Promise.all([
      fetchStats(),
      fetchRecentDoctors(),
      fetchProblemDoctors(),
      fetchLogs(),
    ])
    setLoading(false)
  }

  async function fetchStats() {
    const [
      { count: total },
      { count: actifs },
      { count: inactifs },
      { data: wilayas },
      { data: specialties },
    ] = await Promise.all([
      supabase.from('doctors').select('*', { count: 'exact', head: true }),
      supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('is_active', false),
      supabase.from('doctors').select('wilaya_id').eq('is_active', true),
      supabase.from('doctors').select('specialty_id').eq('is_active', true),
    ])

    const uniqueWilayas = new Set(wilayas?.map(d => d.wilaya_id)).size
    const uniqueSpecialties = new Set(specialties?.map(d => d.specialty_id)).size

    setStats({ total, actifs, inactifs, wilayas: uniqueWilayas, specialties: uniqueSpecialties })
  }

  async function fetchRecentDoctors() {
    const { data } = await supabase
      .from('doctors')
      .select('id, name_fr, slug, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    setRecentDoctors(data || [])
  }

  async function fetchProblemDoctors() {
    const [
      { data: noPhone },
      { data: noAddress },
      { data: noGPS },
    ] = await Promise.all([
      supabase.from('doctors').select('id, name_fr, slug').eq('is_active', true).or('phone.is.null,phone.eq.,phone.eq.N/A').limit(50),
      supabase.from('doctors').select('id, name_fr, slug').eq('is_active', true).or('address.is.null,address.eq.,address.eq.N/A').limit(50),
      supabase.from('doctors').select('id, name_fr, slug').eq('is_active', true).is('latitude', null).limit(50),
    ])

    // Slugs en double
    const { data: allSlugs } = await supabase
      .from('doctors')
      .select('slug')
      .eq('is_active', true)

    const slugCount = {}
    allSlugs?.forEach(d => {
      slugCount[d.slug] = (slugCount[d.slug] || 0) + 1
    })
    const duplicates = Object.entries(slugCount)
      .filter(([, count]) => count > 1)
      .map(([slug]) => slug)

    let duplicateDoctors = []
    if (duplicates.length > 0) {
      const { data } = await supabase
        .from('doctors')
        .select('id, name_fr, slug')
        .in('slug', duplicates.slice(0, 20))
        .eq('is_active', true)
      duplicateDoctors = data || []
    }

    setProblemDoctors({
      noPhone: noPhone || [],
      noAddress: noAddress || [],
      noGPS: noGPS || [],
      duplicateSlugs: duplicateDoctors,
    })
  }

  async function fetchLogs() {
    const { data } = await supabase
      .from('error_404_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setLogs404(data || [])
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Accès Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Dalil Atibaa — Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition">
              Accéder au dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'stats', label: 'Statistiques' },
    { id: 'recent', label: 'Derniers ajouts' },
    { id: 'problems', label: `Problèmes` },
    { id: 'logs', label: 'Erreurs 404' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span className="font-bold text-gray-800">Admin — Dalil Atibaa</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadAllData} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Actualiser
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement des données...</div>
        ) : (
          <>
            {/* STATS CARDS */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                  { label: 'Total médecins', value: stats.total, color: 'text-blue-600' },
                  { label: 'Actifs', value: stats.actifs, color: 'text-green-600' },
                  { label: 'Inactifs', value: stats.inactifs, color: 'text-red-500' },
                  { label: 'Wilayas', value: stats.wilayas, color: 'text-purple-600' },
                  { label: 'Spécialités', value: stats.specialties, color: 'text-amber-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TABS */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: STATS / RECENT */}
            {activeTab === 'recent' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Derniers médecins ajoutés</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">ID</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Nom</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Slug</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentDoctors.map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-400 text-xs">{d.id}</td>
                        <td className="px-6 py-3 text-gray-700 font-medium">{d.name_fr || '—'}</td>
                        <td className="px-6 py-3 text-gray-400 text-xs font-mono">{d.slug}</td>
                        <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(d.created_at).toLocaleDateString('fr-DZ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: PROBLEMS */}
            {activeTab === 'problems' && (
              <div className="space-y-6">

                {/* Résumé problèmes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Sans téléphone', value: problemDoctors.noPhone.length, color: 'text-red-500' },
                    { label: 'Sans adresse', value: problemDoctors.noAddress.length, color: 'text-orange-500' },
                    { label: 'Sans GPS', value: problemDoctors.noGPS.length, color: 'text-amber-500' },
                    { label: 'Slugs en double', value: problemDoctors.duplicateSlugs.length, color: 'text-purple-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tables problèmes */}
                {[
                  { title: 'Médecins sans téléphone', data: problemDoctors.noPhone, color: 'text-red-500' },
                  { title: 'Médecins sans adresse', data: problemDoctors.noAddress, color: 'text-orange-500' },
                  { title: 'Médecins sans coordonnées GPS', data: problemDoctors.noGPS, color: 'text-amber-500' },
                  { title: 'Slugs en double', data: problemDoctors.duplicateSlugs, color: 'text-purple-500' },
                ].map((section, si) => (
                  section.data.length > 0 && (
                    <div key={si} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800">
                          {section.title}
                          <span className={`ml-2 text-sm font-normal ${section.color}`}>
                            ({section.data.length})
                          </span>
                        </h2>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-6 py-3 text-gray-500 font-medium">ID</th>
                            <th className="text-left px-6 py-3 text-gray-500 font-medium">Nom</th>
                            <th className="text-left px-6 py-3 text-gray-500 font-medium">Slug</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {section.data.map((d, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-6 py-3 text-gray-400 text-xs">{d.id}</td>
                              <td className="px-6 py-3 text-gray-700">{d.name_fr || '—'}</td>
                              <td className="px-6 py-3 text-gray-400 text-xs font-mono">{d.slug}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* TAB: LOGS 404 */}
            {activeTab === 'logs' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">
                    Erreurs 404
                    <span className="ml-2 text-sm font-normal text-gray-500">({logs404.length} entrées)</span>
                  </h2>
                </div>
                {logs404.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">Aucune erreur 404 enregistrée</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-gray-500 font-medium">URL</th>
                          <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {logs404.map((log, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-700 font-mono text-xs">{log.url || log.path || '—'}</td>
                            <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString('fr-DZ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: STATS */}
            {activeTab === 'stats' && stats && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-800 mb-4">Médecins</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Total', value: stats.total, bg: 'bg-blue-50', text: 'text-blue-600' },
                      { label: 'Actifs', value: stats.actifs, bg: 'bg-green-50', text: 'text-green-600' },
                      { label: 'Inactifs', value: stats.inactifs, bg: 'bg-red-50', text: 'text-red-500' },
                    ].map((s, i) => (
                      <div key={i} className={`flex justify-between items-center ${s.bg} rounded-xl px-4 py-3`}>
                        <span className="text-gray-600 text-sm">{s.label}</span>
                        <span className={`font-bold ${s.text}`}>{s.value?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-800 mb-4">Couverture</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Wilayas couvertes', value: `${stats.wilayas} / 58`, bg: 'bg-purple-50', text: 'text-purple-600' },
                      { label: 'Spécialités', value: stats.specialties, bg: 'bg-amber-50', text: 'text-amber-600' },
                      { label: 'Médecins / wilaya (moy.)', value: stats.wilayas ? Math.round(stats.actifs / stats.wilayas) : 0, bg: 'bg-teal-50', text: 'text-teal-600' },
                    ].map((s, i) => (
                      <div key={i} className={`flex justify-between items-center ${s.bg} rounded-xl px-4 py-3`}>
                        <span className="text-gray-600 text-sm">{s.label}</span>
                        <span className={`font-bold ${s.text}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-800 mb-4">Qualité des données</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Sans téléphone', value: problemDoctors.noPhone.length, bg: 'bg-red-50', text: 'text-red-500' },
                      { label: 'Sans adresse', value: problemDoctors.noAddress.length, bg: 'bg-orange-50', text: 'text-orange-500' },
                      { label: 'Sans GPS', value: problemDoctors.noGPS.length, bg: 'bg-amber-50', text: 'text-amber-500' },
                      { label: 'Slugs en double', value: problemDoctors.duplicateSlugs.length, bg: 'bg-purple-50', text: 'text-purple-500' },
                    ].map((s, i) => (
                      <div key={i} className={`flex justify-between items-center ${s.bg} rounded-xl px-4 py-3`}>
                        <span className="text-gray-600 text-sm">{s.label}</span>
                        <span className={`font-bold ${s.text}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-800 mb-4">Erreurs 404</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-gray-600 text-sm">Total enregistrées</span>
                      <span className="font-bold text-gray-700">{logs404.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}