-- ══════════════════════════════════════════════════════════════════════════
-- D1 — Création table search_stats
-- À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.search_stats (
  id            BIGSERIAL    PRIMARY KEY,
  query         TEXT,                                    -- texte tapé (optionnel si GPS)
  wilaya_id     INT          REFERENCES public.wilayas(id),
  specialty_id  INT          REFERENCES public.specialties(id),
  results_count INT          DEFAULT 0,                 -- nb de résultats retournés
  gps_used      BOOLEAN      DEFAULT FALSE,             -- true = recherche GPS
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Sécurité Row Level Security ──────────────────────────────────────────
ALTER TABLE public.search_stats ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer (tracking anonyme)
CREATE POLICY "allow_public_insert" ON public.search_stats
  FOR INSERT WITH CHECK (true);

-- Tout le monde peut lire (dashboard admin via anon key)
CREATE POLICY "allow_public_select" ON public.search_stats
  FOR SELECT USING (true);

-- ── Index pour les requêtes dashboard ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_search_stats_created_at   ON public.search_stats (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_stats_wilaya_id    ON public.search_stats (wilaya_id);
CREATE INDEX IF NOT EXISTS idx_search_stats_specialty_id ON public.search_stats (specialty_id);
CREATE INDEX IF NOT EXISTS idx_search_stats_gps          ON public.search_stats (gps_used);
