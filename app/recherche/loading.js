/**
 * ✅ Skeleton UI pour la page de recherche
 * Reproduit la grille de cartes médecins pendant le chargement.
 */
export default function RechercheLoading() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header style={{ backgroundColor: '#1A87D8' }} className="sticky top-0 z-50 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="h-9 w-40 bg-blue-400 rounded-lg animate-pulse" />
          <div className="h-8 w-20 bg-blue-400 rounded-lg animate-pulse" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Compteur résultats */}
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-5" />

        {/* Grille des cartes médecins */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-blue-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
              {/* Étoiles */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              {/* Infos */}
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>
              {/* Bouton */}
              <div className="mt-4 h-9 bg-gray-800 rounded-lg animate-pulse opacity-20" />
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}
