-- ============================================================================
-- Migration: Garantir coluna criado_em em notificacoes_sistema
-- Data: 2026-01-09
-- Problema: Coluna criado_em não existe, causando erro na listagem de notificações
-- ============================================================================

-- Adicionar coluna criado_em se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notificacoes_sistema'
      AND column_name = 'criado_em'
  ) THEN
    -- Verificar se tem created_at para usar como base
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'notificacoes_sistema'
        AND column_name = 'created_at'
    ) THEN
      -- Renomear created_at para criado_em
      ALTER TABLE public.notificacoes_sistema RENAME COLUMN created_at TO criado_em;
      RAISE NOTICE 'Coluna created_at renomeada para criado_em';
    ELSE
      -- Criar coluna nova
      ALTER TABLE public.notificacoes_sistema ADD COLUMN criado_em TIMESTAMPTZ DEFAULT now();
      RAISE NOTICE 'Coluna criado_em adicionada';
    END IF;
  ELSE
    RAISE NOTICE 'Coluna criado_em já existe';
  END IF;
END $$;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_sistema_criado_em
ON public.notificacoes_sistema(criado_em DESC);

-- Verificação
DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notificacoes_sistema'
      AND column_name = 'criado_em'
  ) INTO v_exists;

  IF v_exists THEN
    RAISE NOTICE 'OK: Coluna criado_em existe em notificacoes_sistema';
  ELSE
    RAISE WARNING 'ERRO: Coluna criado_em ainda não existe!';
  END IF;
END $$;
