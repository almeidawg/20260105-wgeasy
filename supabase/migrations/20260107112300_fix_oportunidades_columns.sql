-- ============================================================
-- MIGRATION: Garantir colunas essenciais em oportunidades
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.oportunidades') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'cliente_id'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN cliente_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
      UPDATE public.oportunidades
      SET created_at = COALESCE(created_at, criado_em, NOW());
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.oportunidades') IS NOT NULL
    AND to_regclass('public.pessoas') IS NOT NULL
  THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'cliente_id'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'oportunidades_cliente_id_fkey'
          AND conrelid = 'public.oportunidades'::regclass
      ) THEN
        ALTER TABLE public.oportunidades
          ADD CONSTRAINT oportunidades_cliente_id_fkey
          FOREIGN KEY (cliente_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
      END IF;
    END IF;
  END IF;
END $$;

