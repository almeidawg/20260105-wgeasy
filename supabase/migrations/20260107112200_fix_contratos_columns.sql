-- ============================================================
-- MIGRATION: Garantir colunas essenciais em contratos
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.contratos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'numero'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN numero TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'titulo'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN titulo TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'descricao'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN descricao TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'status'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN status TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'unidade_negocio'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN unidade_negocio TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'cliente_id'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN cliente_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'data_inicio'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN data_inicio DATE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'data_previsao_termino'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN data_previsao_termino DATE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'valor_total'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN valor_total NUMERIC;
    END IF;
  END IF;
END $$;

