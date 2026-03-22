'use client'

import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'GALAXTICOS2025'

export default function Admin404Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchLogs()
    }
  }, [])

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      fetchLogs()
    } else {
      setError('Mot de passe incorrect')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
    setLogs([])
  }

  async function fetchLogs() {
    setLoading(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data } = await supabase
        .from('error_404_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      setLogs(data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Accès Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Dalil Atibaa — Dashboard 404</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition"
            >
              Accéder au dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span className="font-bold text-gray-800">Admin — Erreurs 404</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Actualiser
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">
              Dernières erreurs 404
              <span className="ml-2 text-sm font-normal text-gray-500">({logs.length} entrées)</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Chargement...</div>
          ) : logs.length === 0 ? (
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
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 text-gray-700 font-mono text-xs">{log.url || log.path || JSON.stringify(log)}</td>
                      <td className="px-6 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}