/**
 * ✅ Bug #26 fix : Composant SiteFooter partagé
 *
 * Avant : ~70 lignes de footer copiées-collées dans 6+ fichiers.
 * Après : source unique ici. Pour changer le numéro d'urgence ou le copyright,
 *         on modifie CE fichier et tous les pages sont mises à jour.
 *
 * Usage :
 *   import SiteFooter from '../../components/SiteFooter'
 *   <SiteFooter />                       ← footer FR standard
 *   <SiteFooter lang="ar" />             ← footer en arabe (RTL)
 */
import Link from 'next/link'
import Logo from './Logo'

// Liens Footer — centralisés ici pour éviter les incohérences
const FOOTER_LINKS = {
  utiles: [
    { href: '/',          label: 'Accueil' },
    { href: '/recherche', label: 'Recherche avancée' },
    { href: '/conseils',  label: 'Conseils Médicaux' },
    { href: '/a-propos',  label: 'À propos de nous' },
    { href: '/contact',   label: 'Nous contacter' },
  ],
  specialites: [
    { href: '/specialites/dentiste',      label: 'Dentiste en Algérie' },
    { href: '/specialites/gynecologue',   label: 'Gynécologue en Algérie' },
    { href: '/specialites/cardiologue',   label: 'Cardiologue en Algérie' },
    { href: '/specialites/pediatre',      label: 'Pédiatre en Algérie' },
    { href: '/specialites/ophtalmologue', label: 'Ophtalmologue en Algérie' },
  ],
}

export default function SiteFooter({ lang = 'fr' }) {
  const isAr = lang === 'ar'

  return (
    <footer
      style={{ backgroundColor: '#0f172a' }}
      className="text-gray-400 py-16 border-t border-gray-800 mt-12"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">

          {/* Colonne 1 : À Propos */}
          <div className="space-y-4">
            <Logo dark />
            <p className="text-sm text-gray-300 leading-relaxed">
              {isAr
                ? 'أول دليل طبي في الجزائر. ابحث عن طبيب قريب منك وسهّل وصولك إلى الرعاية الصحية.'
                : 'Le premier annuaire médical en Algérie. Trouvez un professionnel de santé proche de chez vous et facilitez vos démarches de soin au quotidien.'}
            </p>
          </div>

          {/* Colonne 2 : Liens Utiles */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              {isAr ? 'روابط مفيدة' : 'Liens Utiles'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {FOOTER_LINKS.utiles.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={isAr ? `/ar${href === '/' ? '' : href}` : href}
                    className="hover:text-white transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Spécialités */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              {isAr ? 'التخصصات الشائعة' : 'Spécialités Populaires'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {FOOTER_LINKS.specialites.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 : B2B Cabinet */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              {isAr ? 'هل أنت طبيب؟' : 'Vous êtes médecin ?'}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {isAr
                ? 'انضم إلى دليل الأطباء لزيادة ظهور عيادتك وتسهيل وصول مرضاك.'
                : "Rejoignez Dalil Atibaa pour augmenter la visibilité de votre cabinet et simplifier l'accès aux soins de vos patients."}
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#1A87D8] hover:bg-[#1571b6] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              {isAr ? 'تسجيل عيادتي' : 'Inscrire mon cabinet'}
            </Link>
          </div>

        </div>

        {/* Sub-footer */}
        <div className="border-t border-slate-800 mt-12 pt-10 flex flex-col items-center gap-6 text-center text-xs text-gray-300">
          <div className="space-y-3">
            <p className="font-medium">
              {/* ✅ Hydration safe : année calculée côté serveur (Server Component) */}
              © {new Date().getFullYear()} Dalil Atibaa — Annuaire des médecins en Algérie. Tous droits réservés.
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {isAr
                ? 'دليل الأطباء ليس خدمة طوارئ. في حالة الطوارئ الطبية، اتصل بـ 14 أو 115.'
                : "Dalil Atibaa n'est pas un service d'urgence. En cas d'urgence médicale, contactez le 14 ou le 115."}
            </p>
          </div>
          <div className="flex justify-center gap-4 text-gray-400 pt-2">
            <Link href="/a-propos" className="hover:text-white transition">Mentions légales</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition">Support</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
