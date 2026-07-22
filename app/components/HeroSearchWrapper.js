'use client'

// ✅ `dynamic` avec `ssr: false` ne peut être utilisé QUE dans un Client Component.
// Ce wrapper Client Component permet aux Server Components (page.js, recherche/page.js)
// d'importer HeroSearch sans provoquer d'erreur d'hydration.
import dynamic from 'next/dynamic'

const HeroSearch = dynamic(() => import('./HeroSearch'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-2xl p-2.5 flex flex-col sm:flex-row gap-2 animate-pulse">
      <div className="flex-1 h-14 bg-gray-100 rounded-xl" />
      <div className="flex-1 h-14 bg-gray-100 rounded-xl" />
      <div className="flex gap-2">
        <div className="h-14 w-36 bg-gray-100 rounded-xl" />
        <div className="h-14 w-36 bg-blue-100 rounded-xl" />
      </div>
    </div>
  ),
})

export default function HeroSearchWrapper(props) {
  return <HeroSearch {...props} />
}
