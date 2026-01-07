-- ============================================================
-- MIGRATION: Garantir colunas essenciais em analises_projeto
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.analises_projeto') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'analises_projeto'
        AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.analises_projeto ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
      UPDATE public.analises_projeto
      SET created_at = COALESCE(created_at, criado_em, NOW());
    END IF;
  END IF;
END $$;

