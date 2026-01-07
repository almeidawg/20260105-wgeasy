-- ============================================================
-- MIGRATION: Criar estrutura do modulo de assistencia tecnica
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

-- ============================================================
-- TABELA: assistencia_ordens
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assistencia_ordens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT,
  titulo TEXT,
  descricao TEXT,
  tipo_atendimento TEXT NOT NULL DEFAULT 'outros',
  prioridade TEXT DEFAULT 'media',
  status TEXT DEFAULT 'aberta',
  data_abertura DATE,
  data_previsao DATE,
  data_conclusao DATE,
  data_previsao_conclusao DATE,
  cliente_id UUID,
  contrato_id UUID,
  tecnico_responsavel_id UUID,
  endereco_atendimento TEXT,
  equipamento TEXT,
  modelo TEXT,
  numero_serie TEXT,
  problema_relatado TEXT,
  diagnostico TEXT,
  solucao TEXT,
  observacoes TEXT,
  valor_mao_obra NUMERIC DEFAULT 0,
  valor_pecas NUMERIC DEFAULT 0,
  valor_total NUMERIC DEFAULT 0,
  valor_aprovado_cliente BOOLEAN DEFAULT FALSE,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistencia_ordens_cliente_id
  ON public.assistencia_ordens(cliente_id);
CREATE INDEX IF NOT EXISTS idx_assistencia_ordens_status
  ON public.assistencia_ordens(status);
CREATE INDEX IF NOT EXISTS idx_assistencia_ordens_created_at
  ON public.assistencia_ordens(created_at DESC);

-- ============================================================
-- TABELA: os_itens
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL,
  pricelist_item_id UUID,
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  unidade TEXT,
  valor_unitario NUMERIC DEFAULT 0,
  valor_total NUMERIC DEFAULT 0,
  aplicado BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_os_itens_os_id
  ON public.os_itens(os_id);

-- ============================================================
-- TABELA: os_historico
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  status_anterior TEXT,
  status_novo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_os_historico_os_id
  ON public.os_historico(os_id);

-- ============================================================
-- TABELA: assistencia_tecnica
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assistencia_tecnica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  cliente_id UUID NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'aberta',
  prioridade TEXT,
  data_resolucao DATE,
  observacoes TEXT,
  responsavel_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistencia_tecnica_cliente_id
  ON public.assistencia_tecnica(cliente_id);
CREATE INDEX IF NOT EXISTS idx_assistencia_tecnica_status
  ON public.assistencia_tecnica(status);

-- ============================================================
-- FKS OPCIONAIS
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.pessoas') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'assistencia_ordens_cliente_id_fkey'
        AND conrelid = 'public.assistencia_ordens'::regclass
    ) THEN
      ALTER TABLE public.assistencia_ordens
        ADD CONSTRAINT assistencia_ordens_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'assistencia_tecnica_cliente_id_fkey'
        AND conrelid = 'public.assistencia_tecnica'::regclass
    ) THEN
      ALTER TABLE public.assistencia_tecnica
        ADD CONSTRAINT assistencia_tecnica_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.usuarios') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'assistencia_ordens_tecnico_responsavel_id_fkey'
        AND conrelid = 'public.assistencia_ordens'::regclass
    ) THEN
      ALTER TABLE public.assistencia_ordens
        ADD CONSTRAINT assistencia_ordens_tecnico_responsavel_id_fkey
        FOREIGN KEY (tecnico_responsavel_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'assistencia_tecnica_responsavel_id_fkey'
        AND conrelid = 'public.assistencia_tecnica'::regclass
    ) THEN
      ALTER TABLE public.assistencia_tecnica
        ADD CONSTRAINT assistencia_tecnica_responsavel_id_fkey
        FOREIGN KEY (responsavel_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'os_historico_usuario_id_fkey'
        AND conrelid = 'public.os_historico'::regclass
    ) THEN
      ALTER TABLE public.os_historico
        ADD CONSTRAINT os_historico_usuario_id_fkey
        FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.contratos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'assistencia_ordens_contrato_id_fkey'
        AND conrelid = 'public.assistencia_ordens'::regclass
    ) THEN
      ALTER TABLE public.assistencia_ordens
        ADD CONSTRAINT assistencia_ordens_contrato_id_fkey
        FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.os_itens') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'os_itens_os_id_fkey'
        AND conrelid = 'public.os_itens'::regclass
    ) THEN
      ALTER TABLE public.os_itens
        ADD CONSTRAINT os_itens_os_id_fkey
        FOREIGN KEY (os_id) REFERENCES public.assistencia_ordens(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF to_regclass('public.os_historico') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'os_historico_os_id_fkey'
        AND conrelid = 'public.os_historico'::regclass
    ) THEN
      ALTER TABLE public.os_historico
        ADD CONSTRAINT os_historico_os_id_fkey
        FOREIGN KEY (os_id) REFERENCES public.assistencia_ordens(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF to_regclass('public.pricelist_itens') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'os_itens_pricelist_item_id_fkey'
        AND conrelid = 'public.os_itens'::regclass
    ) THEN
      ALTER TABLE public.os_itens
        ADD CONSTRAINT os_itens_pricelist_item_id_fkey
        FOREIGN KEY (pricelist_item_id) REFERENCES public.pricelist_itens(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

