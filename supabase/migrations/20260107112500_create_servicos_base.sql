-- ============================================================
-- MIGRATION: Estrutura base modulo servicos
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

-- ============================================================
-- TABELA: servico_categorias
-- ============================================================
CREATE TABLE IF NOT EXISTS public.servico_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  cor TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servico_categorias_ativo
  ON public.servico_categorias(ativo);

-- ============================================================
-- TABELA: solicitacoes_servico
-- ============================================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT,
  tipo_vinculo TEXT,
  projeto_id UUID,
  cliente_id UUID,
  categoria_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  coletar_tipo TEXT,
  coletar_pessoa_id UUID,
  coletar_endereco_completo TEXT,
  coletar_cep TEXT,
  coletar_logradouro TEXT,
  coletar_numero TEXT,
  coletar_complemento TEXT,
  coletar_bairro TEXT,
  coletar_cidade TEXT,
  coletar_estado TEXT,
  coletar_referencia TEXT,
  entregar_tipo TEXT,
  entregar_pessoa_id UUID,
  entregar_endereco_completo TEXT,
  entregar_cep TEXT,
  entregar_logradouro TEXT,
  entregar_numero TEXT,
  entregar_complemento TEXT,
  entregar_bairro TEXT,
  entregar_cidade TEXT,
  entregar_estado TEXT,
  entregar_referencia TEXT,
  valor_servico NUMERIC DEFAULT 0,
  forma_pagamento TEXT,
  observacoes_pagamento TEXT,
  prestador_id UUID,
  prestador_tipo TEXT,
  data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
  data_necessidade TIMESTAMPTZ,
  data_aceite TIMESTAMPTZ,
  data_inicio_execucao TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  status TEXT DEFAULT 'criado',
  token_aceite TEXT,
  link_expira_em TIMESTAMPTZ,
  lancamento_id UUID,
  solicitacao_pagamento_id UUID,
  motivo_cancelamento TEXT,
  criado_por UUID,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_servico_status
  ON public.solicitacoes_servico(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_servico_categoria_id
  ON public.solicitacoes_servico(categoria_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_servico_cliente_id
  ON public.solicitacoes_servico(cliente_id);

-- ============================================================
-- TABELA: servico_prestadores_convidados
-- ============================================================
CREATE TABLE IF NOT EXISTS public.servico_prestadores_convidados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL,
  prestador_id UUID NOT NULL,
  prestador_tipo TEXT,
  status TEXT DEFAULT 'convidado',
  link_enviado_em TIMESTAMPTZ,
  visualizado_em TIMESTAMPTZ,
  respondido_em TIMESTAMPTZ,
  motivo_recusa TEXT,
  token TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servico_prestadores_convidados_solicitacao_id
  ON public.servico_prestadores_convidados(solicitacao_id);

-- ============================================================
-- TABELA: prestador_categoria_vinculo
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prestador_categoria_vinculo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL,
  categoria_id UUID NOT NULL,
  principal BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prestador_categoria_vinculo_unique
  ON public.prestador_categoria_vinculo(prestador_id, categoria_id);

-- ============================================================
-- TABELA: servico_historico
-- ============================================================
CREATE TABLE IF NOT EXISTS public.servico_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL,
  status_anterior TEXT,
  status_novo TEXT,
  observacao TEXT,
  criado_por UUID,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servico_historico_solicitacao_id
  ON public.servico_historico(solicitacao_id);

-- ============================================================
-- TABELA: servico_anexos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.servico_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL,
  tipo TEXT,
  nome TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  tamanho_bytes INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servico_anexos_solicitacao_id
  ON public.servico_anexos(solicitacao_id);

-- ============================================================
-- AJUSTES: contratos e pedidos_compra
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.contratos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'ativo'
    ) THEN
      ALTER TABLE public.contratos ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
    END IF;
  END IF;

  IF to_regclass('public.pedidos_compra') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'pedidos_compra'
        AND column_name = 'descricao'
    ) THEN
      ALTER TABLE public.pedidos_compra ADD COLUMN descricao TEXT;
    END IF;
  END IF;
END $$;

-- ============================================================
-- FKS OPCIONAIS
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.pessoas') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'solicitacoes_servico_prestador_id_fkey'
        AND conrelid = 'public.solicitacoes_servico'::regclass
    ) THEN
      ALTER TABLE public.solicitacoes_servico
        ADD CONSTRAINT solicitacoes_servico_prestador_id_fkey
        FOREIGN KEY (prestador_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'solicitacoes_servico_cliente_id_fkey'
        AND conrelid = 'public.solicitacoes_servico'::regclass
    ) THEN
      ALTER TABLE public.solicitacoes_servico
        ADD CONSTRAINT solicitacoes_servico_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'servico_prestadores_convidados_prestador_id_fkey'
        AND conrelid = 'public.servico_prestadores_convidados'::regclass
    ) THEN
      ALTER TABLE public.servico_prestadores_convidados
        ADD CONSTRAINT servico_prestadores_convidados_prestador_id_fkey
        FOREIGN KEY (prestador_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'prestador_categoria_vinculo_prestador_id_fkey'
        AND conrelid = 'public.prestador_categoria_vinculo'::regclass
    ) THEN
      ALTER TABLE public.prestador_categoria_vinculo
        ADD CONSTRAINT prestador_categoria_vinculo_prestador_id_fkey
        FOREIGN KEY (prestador_id) REFERENCES public.pessoas(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF to_regclass('public.servico_categorias') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'solicitacoes_servico_categoria_id_fkey'
        AND conrelid = 'public.solicitacoes_servico'::regclass
    ) THEN
      ALTER TABLE public.solicitacoes_servico
        ADD CONSTRAINT solicitacoes_servico_categoria_id_fkey
        FOREIGN KEY (categoria_id) REFERENCES public.servico_categorias(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'prestador_categoria_vinculo_categoria_id_fkey'
        AND conrelid = 'public.prestador_categoria_vinculo'::regclass
    ) THEN
      ALTER TABLE public.prestador_categoria_vinculo
        ADD CONSTRAINT prestador_categoria_vinculo_categoria_id_fkey
        FOREIGN KEY (categoria_id) REFERENCES public.servico_categorias(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF to_regclass('public.contratos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'solicitacoes_servico_projeto_id_fkey'
        AND conrelid = 'public.solicitacoes_servico'::regclass
    ) THEN
      ALTER TABLE public.solicitacoes_servico
        ADD CONSTRAINT solicitacoes_servico_projeto_id_fkey
        FOREIGN KEY (projeto_id) REFERENCES public.contratos(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'servico_prestadores_convidados_solicitacao_id_fkey'
      AND conrelid = 'public.servico_prestadores_convidados'::regclass
  ) THEN
    ALTER TABLE public.servico_prestadores_convidados
      ADD CONSTRAINT servico_prestadores_convidados_solicitacao_id_fkey
      FOREIGN KEY (solicitacao_id) REFERENCES public.solicitacoes_servico(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'servico_historico_solicitacao_id_fkey'
      AND conrelid = 'public.servico_historico'::regclass
  ) THEN
    ALTER TABLE public.servico_historico
      ADD CONSTRAINT servico_historico_solicitacao_id_fkey
      FOREIGN KEY (solicitacao_id) REFERENCES public.solicitacoes_servico(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'servico_anexos_solicitacao_id_fkey'
      AND conrelid = 'public.servico_anexos'::regclass
  ) THEN
    ALTER TABLE public.servico_anexos
      ADD CONSTRAINT servico_anexos_solicitacao_id_fkey
      FOREIGN KEY (solicitacao_id) REFERENCES public.solicitacoes_servico(id) ON DELETE CASCADE;
  END IF;
END $$;

