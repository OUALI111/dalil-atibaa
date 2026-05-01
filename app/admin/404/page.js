'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const ADMIN_USERNAME = 'LEADMAGNUS'
const ADMIN_PASSWORD = 'GALAXTICOS2025'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function generateSlug(name, wilayaName, id) {
  const arabicMap = {
    'ا':'a','أ':'a','إ':'a','آ':'a','ب':'b','ت':'t','ث':'th',
    'ج':'dj','ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z',
    'س':'s','ش':'ch','ص':'s','ض':'d','ط':'t','ظ':'dh','ع':'a',
    'غ':'gh','ف':'f','ق':'k','ك':'k','ل':'l','م':'m','ن':'n',
    'ه':'h','و':'w','ي':'y','ى':'a','ة':'a','ء':'','ئ':'y',
    'ؤ':'w','لا':'la','َ':'','ُ':'','ِ':'','ّ':'','ً':'','ٌ':'','ٍ':'',
  }

  let text = (name + ' ' + (wilayaName || '')).toLowerCase()

  // تحويل الحروف العربية
  text = text.replace(/[أإآا]/g, 'a')
  text = text.replace(/ب/g, 'b')
  text = text.replace(/ت/g, 't')
  text = text.replace(/ث/g, 'th')
  text = text.replace(/ج/g, 'dj')
  text = text.replace(/ح/g, 'h')
  text = text.replace(/خ/g, 'kh')
  text = text.replace(/د/g, 'd')
  text = text.replace(/ذ/g, 'dh')
  text = text.replace(/ر/g, 'r')
  text = text.replace(/ز/g, 'z')
  text = text.replace(/س/g, 's')
  text = text.replace(/ش/g, 'ch')
  text = text.replace(/ص/g, 's')
  text = text.replace(/ض/g, 'd')
  text = text.replace(/ط/g, 't')
  text = text.replace(/ظ/g, 'dh')
  text = text.replace(/ع/g, 'a')
  text = text.replace(/غ/g, 'gh')
  text = text.replace(/ف/g, 'f')
  text = text.replace(/ق/g, 'k')
  text = text.replace(/ك/g, 'k')
  text = text.replace(/ل/g, 'l')
  text = text.replace(/م/g, 'm')
  text = text.replace(/ن/g, 'n')
  text = text.replace(/ه/g, 'h')
  text = text.replace(/و/g, 'w')
  text = text.replace(/[يى]/g, 'y')
  text = text.replace(/ة/g, 'a')
  text = text.replace(/[ءئؤ]/g, '')
  text = text.replace(/[\u064B-\u065F]/g, '') // حذف التشكيل

  // تحويل الحروف الفرنسية
  const frMap = { é:'e',è:'e',ê:'e',à:'a',â:'a',î:'i',ô:'o',ù:'u',û:'u',ç:'c',ë:'e',ï:'i' }
  text = text.replace(/[éèêàâîôùûçëï]/g, c => frMap[c] || c)

  text = text.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return text + '-' + id
}

function generateConseilSlug(text, lang) {
  if (lang === 'ar') {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 80) + '-' + Date.now().toString().slice(-6)
  }
  let slug = text.toLowerCase()
  const map = { é:'e',è:'e',ê:'e',à:'a',â:'a',î:'i',ô:'o',ù:'u',û:'u',ç:'c',ë:'e',ï:'i' }
  slug = slug.replace(/[éèêàâîôùûçëï]/g, c => map[c] || c)
  slug = slug.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
  return slug
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(false)

  const [stats, setStats] = useState(null)
  const [recentDoctors, setRecentDoctors] = useState([])
  const [problemDoctors, setProblemDoctors] = useState({ noPhone:[], noAddress:[], noGPS:[], duplicateSlugs:[] })
  const [logs404, setLogs404] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [wilayas, setWilayas] = useState([])

  const [form, setForm] = useState({ name_fr:'', specialty_id:'', wilaya_id:'', phone:'', address:'', google_map_url:'', rating:'' })
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')
  const [formError, setFormError] = useState('')

  const [conseilForm, setConseilForm] = useState({ lang:'fr', question_fr:'', answer_fr:'', question_ar:'', answer_ar:'', specialty_id:'', wilaya_id:'' })
  const [conseilLoading, setConseilLoading] = useState(false)
  const [conseilSuccess, setConseilSuccess] = useState('')
  const [conseilError, setConseilError] = useState('')

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') { setIsAuthenticated(true); loadAllData() }
  }, [])

  function handleLogin(e) {
    e.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      loadAllData()
    } else { setError('Nom utilisateur ou mot de passe incorrect') }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
    setStats(null)
  }

  async function loadAllData() {
    setLoading(true)
    await Promise.all([fetchStats(), fetchRecentDoctors(), fetchProblemDoctors(), fetchLogs(), fetchSpecialtiesWilayas()])
    setLoading(false)
  }

  async function fetchSpecialtiesWilayas() {
    const [{ data: sp }, { data: wi }] = await Promise.all([
      supabase.from('specialties').select('id, name_fr').order('name_fr'),
      supabase.from('wilayas').select('id, name_fr').order('name_fr'),
    ])
    setSpecialties(sp || [])
    setWilayas(wi || [])
  }

  async function fetchStats() {
    const [{ count: total }, { count: actifs }, { count: inactifs }, { data: wi }, { data: sp }] = await Promise.all([
      supabase.from('doctors').select('*', { count:'exact', head:true }),
      supabase.from('doctors').select('*', { count:'exact', head:true }).eq('is_active', true),
      supabase.from('doctors').select('*', { count:'exact', head:true }).eq('is_active', false),
      supabase.from('doctors').select('wilaya_id').eq('is_active', true),
      supabase.from('doctors').select('specialty_id').eq('is_active', true),
    ])
    const uniqueWilayas = new Set(wi?.map(d => d.wilaya_id)).size
    const uniqueSpecialties = new Set(sp?.map(d => d.specialty_id)).size
    setStats({ total, actifs, inactifs, wilayas: uniqueWilayas, specialties: uniqueSpecialties })
  }

  async function fetchRecentDoctors() {
    const { data } = await supabase.from('doctors').select('id, name_fr, slug, created_at').order('created_at', { ascending: false }).limit(10)
    setRecentDoctors(data || [])
  }

  async function fetchProblemDoctors() {
    const [{ data: noPhone }, { data: noAddress }, { data: noGPS }] = await Promise.all([
      supabase.from('doctors').select('id, name_fr, slug').eq('is_active', true).or('phone.is.null,phone.eq.,phone.eq.N/A').limit(50),
      supabase.from('doctors').select('id, name_fr, slug').eq('is_active', true).or('address.is.null,address.eq.,address.eq.N/A').limit(50),
      supabase.from('doctors').select('id, name_fr, slug').eq('is_active', true).is('latitude', null).limit(50),
    ])
    const { data: allSlugs } = await supabase.from('doctors').select('id, name_fr, slug').eq('is_active', true)
    const slugCount = {}
    allSlugs?.forEach(d => { slugCount[d.slug] = (slugCount[d.slug] || 0) + 1 })
    const duplicateDoctors = allSlugs?.filter(d => slugCount[d.slug] > 1) || []
    setProblemDoctors({ noPhone: noPhone||[], noAddress: noAddress||[], noGPS: noGPS||[], duplicateSlugs: duplicateDoctors.slice(0,50) })
  }

  async function fetchLogs() {
    const { data } = await supabase.from('error_404_log').select('*').order('created_at', { ascending: false }).limit(100)
    setLogs404(data || [])
  }

  async function handleAddDoctor(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormSuccess('')
    setFormError('')

    if (!form.name_fr || !form.specialty_id || !form.wilaya_id) {
      setFormError('Nom, spécialité et wilaya sont obligatoires')
      setFormLoading(false)
      return
    }

    try {
      const wilayaName = wilayas.find(w => w.id == form.wilaya_id)?.name_fr || ''
      const insertData = {
  slug,
  lang: conseilForm.lang,
  question_fr: conseilForm.lang === 'fr' 
    ? conseilForm.question_fr 
    : (conseilForm.question_ar || 'question-ar'),
  answer_fr: conseilForm.lang === 'fr' 
    ? conseilForm.answer_fr 
    : '',
  question_ar: conseilForm.question_ar || null,
  answer_ar: conseilForm.answer_ar || null,
  specialty_id: parseInt(conseilForm.specialty_id),
  wilaya_id: conseilForm.wilaya_id ? parseInt(conseilForm.wilaya_id) : null,
  is_active: true,
  is_verified: false,
  slug: 'temp-slug',
      }

      const { data, error: insertError } = await supabase.from('doctors').insert(insertData).select('id').single()
      if (insertError) throw insertError

      const slug = generateSlug(form.name_fr, wilayaName, data.id)
      await supabase.from('doctors').update({ slug, search_vector: null }).eq('id', data.id)

      setFormSuccess(`✅ Dr. ${form.name_fr} ajouté ! Slug : ${slug}`)
      setForm({ name_fr:'', specialty_id:'', wilaya_id:'', phone:'', address:'', google_map_url:'', rating:'' })
      fetchStats()
      fetchRecentDoctors()
    } catch (err) {
      setFormError('Erreur : ' + err.message)
    }
    setFormLoading(false)
  }

 async function handleAddConseil(e) {
    e.preventDefault()
    setConseilLoading(true)
    setConseilSuccess('')
    setConseilError('')

    const isFr = conseilForm.lang === 'fr'

    if (isFr && (!conseilForm.question_fr || !conseilForm.answer_fr)) {
      setConseilError('Question et réponse en français sont obligatoires')
      setConseilLoading(false)
      return
    }
    if (!isFr && (!conseilForm.question_ar || !conseilForm.answer_ar)) {
      setConseilError('السؤال والجواب بالعربية إلزاميان')
      setConseilLoading(false)
      return
    }
    if (!conseilForm.specialty_id) {
      setConseilError('La spécialité est obligatoire')
      setConseilLoading(false)
      return
    }

    try {
      const questionText = isFr ? conseilForm.question_fr : conseilForm.question_ar
      const slug = generateConseilSlug(questionText, conseilForm.lang)

      const insertData = {
        slug,
        lang: conseilForm.lang,
        question_fr: isFr ? conseilForm.question_fr : `ar-${slug}`,
        answer_fr: isFr ? conseilForm.answer_fr : '',
        question_ar: conseilForm.question_ar || null,
        answer_ar: conseilForm.answer_ar || null,
        specialty_id: parseInt(conseilForm.specialty_id),
        wilaya_id: conseilForm.wilaya_id ? parseInt(conseilForm.wilaya_id) : null,
        is_active: true,
      }

      const { error: insertError } = await supabase.from('conseils').insert(insertData)
      if (insertError) throw insertError

      setConseilSuccess(`✅ Conseil ajouté ! URL : /${isFr ? '' : 'ar/'}conseils/${slug}`)
      setConseilForm({ lang:'fr', question_fr:'', answer_fr:'', question_ar:'', answer_ar:'', specialty_id:'', wilaya_id:'' })
    } catch (err) {
      setConseilError('Erreur : ' + err.message)
    }
    setConseilLoading(false)
  }

    try {
      const questionText = isFr ? conseilForm.question_fr : conseilForm.question_ar
      const slug = generateConseilSlug(questionText, conseilForm.lang)

      const insertData = {
        slug,
        lang: conseilForm.lang,
        question_fr: conseilForm.question_fr || null,
        answer_fr: conseilForm.answer_fr || null,
        question_ar: conseilForm.question_ar || null,
        answer_ar: conseilForm.answer_ar || null,
        specialty_id: parseInt(conseilForm.specialty_id),
        wilaya_id: conseilForm.wilaya_id ? parseInt(conseilForm.wilaya_id) : null,
        is_active: true,
      }

      const { error: insertError } = await supabase.from('conseils').insert(insertData)
      if (insertError) throw insertError

      setConseilSuccess(`✅ Conseil ajouté ! URL : /${isFr ? '' : 'ar/'}conseils/${slug}`)
      setConseilForm({ lang:'fr', question_fr:'', answer_fr:'', question_ar:'', answer_ar:'', specialty_id:'', wilaya_id:'' })
    } catch (err) {
      setConseilError('Erreur : ' + err.message)
    }
    setConseilLoading(false)
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
              <label className="text-sm font-medium text-gray-700 block mb-1">Nom utilisateur</label>
              <input type="text" value={username} onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="Username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
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
    { id:'stats', label:'Statistiques' },
    { id:'add', label:'➕ Médecin' },
    { id:'conseil', label:'✍️ Conseil' },
    { id:'recent', label:'Derniers ajouts' },
    { id:'problems', label:'Problèmes' },
    { id:'logs', label:'Erreurs 404' },
  ]

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
            <span className="font-bold text-gray-800">Admin — Dalil Atibaa</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadAllData} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Actualiser</button>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">Déconnexion</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                  { label:'Total médecins', value:stats.total, color:'text-blue-600' },
                  { label:'Actifs', value:stats.actifs, color:'text-green-600' },
                  { label:'Inactifs', value:stats.inactifs, color:'text-red-500' },
                  { label:'Wilayas', value:stats.wilayas, color:'text-purple-600' },
                  { label:'Spécialités', value:stats.specialties, color:'text-amber-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-6 flex-wrap">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: ADD CONSEIL */}
            {activeTab === 'conseil' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                <h2 className="font-bold text-gray-800 mb-6 text-lg">✍️ Ajouter un conseil médical</h2>

                {conseilSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
                    {conseilSuccess}
                  </div>
                )}
                {conseilError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                    {conseilError}
                  </div>
                )}

                <form onSubmit={handleAddConseil} className="space-y-4">

                  {/* اختيار اللغة */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Langue *</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setConseilForm({...conseilForm, lang:'fr'})}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${conseilForm.lang === 'fr' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                        🇫🇷 Français
                      </button>
                      <button type="button" onClick={() => setConseilForm({...conseilForm, lang:'ar'})}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${conseilForm.lang === 'ar' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                        🇩🇿 عربي
                      </button>
                    </div>
                  </div>

                  {/* حقول الفرنسية */}
                  {conseilForm.lang === 'fr' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Question (FR) *</label>
                        <input type="text" value={conseilForm.question_fr}
                          onChange={e => setConseilForm({...conseilForm, question_fr: e.target.value})}
                          placeholder="Quand consulter un dentiste pour..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Réponse (FR) *</label>
                        <textarea rows={4} value={conseilForm.answer_fr}
                          onChange={e => setConseilForm({...conseilForm, answer_fr: e.target.value})}
                          placeholder="Réponse claire en 3-4 lignes..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none" />
                      </div>
                    </>
                  )}

                  {/* حقول العربية */}
                  {conseilForm.lang === 'ar' && (
                    <>
                      <div dir="rtl">
                        <label className="text-sm font-medium text-gray-700 block mb-1">السؤال *</label>
                        <input type="text" value={conseilForm.question_ar}
                          onChange={e => setConseilForm({...conseilForm, question_ar: e.target.value})}
                          placeholder="متى يجب أن أزور طبيب الأسنان..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 text-right" />
                      </div>
                      <div dir="rtl">
                        <label className="text-sm font-medium text-gray-700 block mb-1">الجواب *</label>
                        <textarea rows={4} value={conseilForm.answer_ar}
                          onChange={e => setConseilForm({...conseilForm, answer_ar: e.target.value})}
                          placeholder="جواب واضح من 3 إلى 4 أسطر..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none text-right" />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Spécialité *</label>
                      <select value={conseilForm.specialty_id}
                        onChange={e => setConseilForm({...conseilForm, specialty_id: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white">
                        <option value="">Choisir...</option>
                        {specialties.map(s => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Wilaya (optionnel)</label>
                      <select value={conseilForm.wilaya_id}
                        onChange={e => setConseilForm({...conseilForm, wilaya_id: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white">
                        <option value="">Toutes wilayas</option>
                        {wilayas.map(w => <option key={w.id} value={w.id}>{w.name_fr}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={conseilLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl text-sm transition">
                      {conseilLoading ? 'Enregistrement...' : '✍️ Publier le conseil'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: ADD DOCTOR */}
            {activeTab === 'add' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                <h2 className="font-bold text-gray-800 mb-6 text-lg">Ajouter un médecin</h2>
                {formSuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">{formSuccess}</div>}
                {formError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{formError}</div>}
                <form onSubmit={handleAddDoctor} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Nom du médecin / cabinet *</label>
                    <input type="text" value={form.name_fr} onChange={e => setForm({...form, name_fr: e.target.value})}
                      placeholder="Dr. Mohammed Benali"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Spécialité *</label>
                      <select value={form.specialty_id} onChange={e => setForm({...form, specialty_id: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white">
                        <option value="">Choisir...</option>
                        {specialties.map(s => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Wilaya *</label>
                      <select value={form.wilaya_id} onChange={e => setForm({...form, wilaya_id: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white">
                        <option value="">Choisir...</option>
                        {wilayas.map(w => <option key={w.id} value={w.id}>{w.name_fr}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Téléphone</label>
                    <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="0555 123 456"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Adresse</label>
                    <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                      placeholder="12 Rue Didouche Mourad, Alger"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Lien Google Maps</label>
                    <input type="text" value={form.google_map_url} onChange={e => setForm({...form, google_map_url: e.target.value})}
                      placeholder="https://maps.google.com/..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Note (0 à 5)</label>
                    <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}
                      placeholder="4.5"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={formLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl text-sm transition">
                      {formLoading ? 'Enregistrement...' : 'Enregistrer le médecin'}
                    </button>
                  </div>
                  {form.name_fr && form.wilaya_id && (
                    <p className="text-xs text-gray-400 text-center">
                      Slug : <span className="font-mono text-blue-500">{generateSlug(form.name_fr, wilayas.find(w => w.id == form.wilaya_id)?.name_fr || '', 'ID')}</span>
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* TAB: STATS */}
            {activeTab === 'stats' && stats && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-800 mb-4">Médecins</h2>
                  <div className="space-y-3">
                    {[
                      { label:'Total', value:stats.total, bg:'bg-blue-50', text:'text-blue-600' },
                      { label:'Actifs', value:stats.actifs, bg:'bg-green-50', text:'text-green-600' },
                      { label:'Inactifs', value:stats.inactifs, bg:'bg-red-50', text:'text-red-500' },
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
                      { label:'Wilayas couvertes', value:`${stats.wilayas} / 58`, bg:'bg-purple-50', text:'text-purple-600' },
                      { label:'Spécialités', value:stats.specialties, bg:'bg-amber-50', text:'text-amber-600' },
                      { label:'Médecins / wilaya (moy.)', value:stats.wilayas ? Math.round(stats.actifs / stats.wilayas) : 0, bg:'bg-teal-50', text:'text-teal-600' },
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
                      { label:'Sans téléphone', value:problemDoctors.noPhone.length, bg:'bg-red-50', text:'text-red-500' },
                      { label:'Sans adresse', value:problemDoctors.noAddress.length, bg:'bg-orange-50', text:'text-orange-500' },
                      { label:'Sans GPS', value:problemDoctors.noGPS.length, bg:'bg-amber-50', text:'text-amber-500' },
                      { label:'Slugs en double', value:problemDoctors.duplicateSlugs.length, bg:'bg-purple-50', text:'text-purple-500' },
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

            {/* TAB: RECENT */}
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
                        <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(d.created_at).toLocaleDateString('fr-DZ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: PROBLEMS */}
            {activeTab === 'problems' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label:'Sans téléphone', value:problemDoctors.noPhone.length, color:'text-red-500' },
                    { label:'Sans adresse', value:problemDoctors.noAddress.length, color:'text-orange-500' },
                    { label:'Sans GPS', value:problemDoctors.noGPS.length, color:'text-amber-500' },
                    { label:'Slugs en double', value:problemDoctors.duplicateSlugs.length, color:'text-purple-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                {[
                  { title:'Médecins sans téléphone', data:problemDoctors.noPhone, color:'text-red-500' },
                  { title:'Médecins sans adresse', data:problemDoctors.noAddress, color:'text-orange-500' },
                  { title:'Médecins sans coordonnées GPS', data:problemDoctors.noGPS, color:'text-amber-500' },
                  { title:'Slugs en double', data:problemDoctors.duplicateSlugs, color:'text-purple-500' },
                ].map((section, si) => section.data.length > 0 && (
                  <div key={si} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h2 className="font-bold text-gray-800">{section.title} <span className={`ml-2 text-sm font-normal ${section.color}`}>({section.data.length})</span></h2>
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
                ))}
              </div>
            )}

            {/* TAB: LOGS 404 */}
            {activeTab === 'logs' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Erreurs 404 <span className="ml-2 text-sm font-normal text-gray-500">({logs404.length})</span></h2>
                </div>
                {logs404.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">Aucune erreur 404 enregistrée</div>
                ) : (
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
                          <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString('fr-DZ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}