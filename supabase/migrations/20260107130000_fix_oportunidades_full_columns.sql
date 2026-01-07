-- ============================================================
-- MIGRATION: Adicionar colunas completas em oportunidades
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07 13:00:00
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.oportunidades') IS NOT NULL THEN
    -- titulo
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'titulo'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN titulo TEXT;
    END IF;

    -- descricao
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'descricao'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN descricao TEXT;
    END IF;

    -- valor
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'valor'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN valor NUMERIC;
    END IF;

    -- estagio
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'estagio'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN estagio TEXT DEFAULT 'qualificacao';
    END IF;

    -- status
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'status'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN status TEXT DEFAULT 'novo';
    END IF;

    -- origem
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'origem'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN origem TEXT;
    END IF;

    -- responsavel_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'responsavel_id'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN responsavel_id UUID;
    END IF;

    -- previsao_fechamento
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'previsao_fechamento'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN previsao_fechamento DATE;
    END IF;

    -- observacoes
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'observacoes'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN observacoes TEXT;
    END IF;

    -- atualizado_em
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'atualizado_em'
    ) THEN
      ALTER TABLE public.oportunidades ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Copiar data_previsao_fechamento para previsao_fechamento se existir
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'oportunidades'
        AND column_name = 'data_previsao_fechamento'
    ) THEN
      UPDATE public.oportunidades
      SET previsao_fechamento = data_previsao_fechamento::DATE
      WHERE previsao_fechamento IS NULL
        AND data_previsao_fechamento IS NOT NULL;
    END IF;

  END IF;
END $$;

-- Criar indices
CREATE INDEX IF NOT EXISTS idx_oportunidades_cliente_id ON public.oportunidades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_estagio ON public.oportunidades(estagio);
CREATE INDEX IF NOT EXISTS idx_oportunidades_status ON public.oportunidades(status);
