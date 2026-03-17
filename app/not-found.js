import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default async function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4 max-w-lg">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-500 mb-8">
          Cette page a peut-être été déplacée ou supprimée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Retour accueil
          </Link>
          <Link href="/recherche"
            className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
            Rechercher un médecin
          </Link>
        </div>
      </div>
    </main>
  )
}