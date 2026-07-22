/**
 * ✅ Bug #24 fix : loading.js — Skeleton UI pour la fiche médecin
 *
 * Next.js App Router affiche ce composant automatiquement pendant que
 * la page async (page.js) attend les données de Supabase.
 *
 * Sans ce fichier : page blanche pendant 200-800ms → mauvaise UX, CLS élevé.
 * Avec ce fichier : skeleton animé fidèle à la vraie page → UX fluide, CLS = 0.
 *
 * Le skeleton reproduit pixel-pour-pixel la structure de page.js :
 *   - Header bleu avec logo placeholder
 *   - Breadcrumb
 *   - Colonne principale (carte médecin, services, carte)
 *   - Sidebar (boutons, stats, info)
 */
export default function DoctorLoading() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER — même hauteur que le vrai */}
      <header style={{ backgroundColor: '#1A87D8' }} className="py-4 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          {/* Logo placeholder */}
          <div className="h-9 w-40 bg-blue-400 rounded-lg animate-pulse" />
          {/* Bouton AR placeholder */}
          <div className="h-8 w-24 bg-blue-400 rounded-lg animate-pulse" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <span className="text-gray-300">/</span>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <span className="text-gray-300">/</span>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══════════════════════════════════════
              COLONNE PRINCIPALE (2/3)
          ═══════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Carte profil médecin */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />

                <div className="flex-1 space-y-3">
                  {/* Nom */}
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                  {/* Spécialité */}
                  <div className="h-4 w-32 bg-blue-100 rounded animate-pulse" />
                  {/* Étoiles */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                  {/* Adresse */}
                  <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>

              {/* Boutons Appeler / WhatsApp */}
              <div className="flex gap-3 mt-5">
                <div className="flex-1 h-12 bg-gray-800 rounded-xl animate-pulse opacity-30" />
                <div className="flex-1 h-12 bg-green-500 rounded-xl animate-pulse opacity-30" />
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-blue-50 border border-blue-100 rounded-full animate-pulse"
                    style={{ width: `${60 + i * 20}px` }} />
                ))}
              </div>
            </div>

            {/* Carte / Localisation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="w-full h-52 bg-gray-100 rounded-2xl animate-pulse" />
            </div>

            {/* Médecins similaires */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════
              SIDEBAR (1/3)
          ═══════════════════════════════════════ */}
          <div className="space-y-4">

            {/* Bloc bleu Appeler */}
            <div style={{ backgroundColor: '#1A87D8' }} className="rounded-2xl p-6">
              <div className="h-4 w-36 bg-blue-400 rounded animate-pulse mb-4" />
              <div className="h-12 w-full bg-blue-400 rounded-xl animate-pulse mb-3" />
              <div className="h-12 w-full bg-green-400 rounded-xl animate-pulse opacity-70" />
            </div>

            {/* Informations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 bg-gray-200 rounded animate-pulse w-1/3" />
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mx-auto" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ✅ Barre de progression — <style> standard (pas de styled-jsx qui requiert 'use client') */}
      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .loading-bar-anim {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 overflow-hidden">
        <div
          style={{ backgroundColor: '#1A87D8' }}
          className="h-full w-1/3 loading-bar-anim"
        />
      </div>

    </main>
  )
}
