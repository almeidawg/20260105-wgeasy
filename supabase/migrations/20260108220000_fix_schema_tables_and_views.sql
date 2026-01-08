-- ============================================================================
-- Migration: Corrigir tabelas e views faltantes no schema public
-- Data: 2026-01-08
-- Contexto: Views apontam para z_archive_20260104 mas tabelas não existem em public
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA orcamento_itens
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  unidade TEXT DEFAULT 'un',
  quantidade NUMERIC(12,4) DEFAULT 1,
  valor_unitario NUMERIC(14,2) DEFAULT 0,
  valor_total NUMERIC(14,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  ambiente TEXT,
  categoria TEXT,
  fornecedor TEXT,
  observacoes TEXT,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento ON public.orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_categoria ON public.orcamento_itens(categoria);

-- RLS
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orcamento_itens_select" ON public.orcamento_itens;
CREATE POLICY "orcamento_itens_select" ON public.orcamento_itens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "orcamento_itens_insert" ON public.orcamento_itens;
CREATE POLICY "orcamento_itens_insert" ON public.orcamento_itens
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "orcamento_itens_update" ON public.orcamento_itens;
CREATE POLICY "orcamento_itens_update" ON public.orcamento_itens
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "orcamento_itens_delete" ON public.orcamento_itens;
CREATE POLICY "orcamento_itens_delete" ON public.orcamento_itens
  FOR DELETE USING (true);

-- ============================================================================
-- 2. CRIAR TABELA propostas_ambientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.propostas_ambientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  area_m2 NUMERIC(10,2),
  valor_subtotal NUMERIC(14,2) DEFAULT 0,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propostas_ambientes_proposta ON public.propostas_ambientes(proposta_id);

-- RLS
ALTER TABLE public.propostas_ambientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "propostas_ambientes_select" ON public.propostas_ambientes;
CREATE POLICY "propostas_ambientes_select" ON public.propostas_ambientes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "propostas_ambientes_insert" ON public.propostas_ambientes;
CREATE POLICY "propostas_ambientes_insert" ON public.propostas_ambientes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "propostas_ambientes_update" ON public.propostas_ambientes;
CREATE POLICY "propostas_ambientes_update" ON public.propostas_ambientes
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "propostas_ambientes_delete" ON public.propostas_ambientes;
CREATE POLICY "propostas_ambientes_delete" ON public.propostas_ambientes
  FOR DELETE USING (true);

-- ============================================================================
-- 3. CRIAR TABELA propostas_itens
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.propostas_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE CASCADE,
  ambiente_id UUID REFERENCES public.propostas_ambientes(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  unidade TEXT DEFAULT 'un',
  quantidade NUMERIC(12,4) DEFAULT 1,
  valor_unitario NUMERIC(14,2) DEFAULT 0,
  valor_total NUMERIC(14,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  nucleo TEXT, -- 'ARQUITETURA', 'ENGENHARIA', 'MARCENARIA'
  categoria TEXT,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propostas_itens_proposta ON public.propostas_itens(proposta_id);
CREATE INDEX IF NOT EXISTS idx_propostas_itens_ambiente ON public.propostas_itens(ambiente_id);
CREATE INDEX IF NOT EXISTS idx_propostas_itens_nucleo ON public.propostas_itens(nucleo);

-- RLS
ALTER TABLE public.propostas_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "propostas_itens_select" ON public.propostas_itens;
CREATE POLICY "propostas_itens_select" ON public.propostas_itens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "propostas_itens_insert" ON public.propostas_itens;
CREATE POLICY "propostas_itens_insert" ON public.propostas_itens
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "propostas_itens_update" ON public.propostas_itens;
CREATE POLICY "propostas_itens_update" ON public.propostas_itens
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "propostas_itens_delete" ON public.propostas_itens;
CREATE POLICY "propostas_itens_delete" ON public.propostas_itens
  FOR DELETE USING (true);

-- ============================================================================
-- 4. CRIAR TABELA pipeline_wg_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pipeline_wg_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  estagio TEXT NOT NULL DEFAULT 'lead', -- lead, qualificacao, proposta, negociacao, fechado_ganho, fechado_perdido
  valor_estimado NUMERIC(14,2) DEFAULT 0,
  probabilidade INTEGER DEFAULT 50 CHECK (probabilidade >= 0 AND probabilidade <= 100),
  cliente_id UUID REFERENCES public.pessoas(id),
  responsavel_id UUID REFERENCES public.pessoas(id),
  oportunidade_id UUID REFERENCES public.oportunidades(id),
  contrato_id UUID REFERENCES public.contratos(id),
  data_previsao_fechamento DATE,
  data_fechamento DATE,
  motivo_perda TEXT,
  fonte TEXT,
  tags TEXT[],
  prioridade TEXT DEFAULT 'media', -- baixa, media, alta
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pipeline_wg_items_estagio ON public.pipeline_wg_items(estagio);
CREATE INDEX IF NOT EXISTS idx_pipeline_wg_items_cliente ON public.pipeline_wg_items(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_wg_items_responsavel ON public.pipeline_wg_items(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_wg_items_oportunidade ON public.pipeline_wg_items(oportunidade_id);

-- RLS
ALTER TABLE public.pipeline_wg_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pipeline_wg_items_select" ON public.pipeline_wg_items;
CREATE POLICY "pipeline_wg_items_select" ON public.pipeline_wg_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "pipeline_wg_items_insert" ON public.pipeline_wg_items;
CREATE POLICY "pipeline_wg_items_insert" ON public.pipeline_wg_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "pipeline_wg_items_update" ON public.pipeline_wg_items;
CREATE POLICY "pipeline_wg_items_update" ON public.pipeline_wg_items
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "pipeline_wg_items_delete" ON public.pipeline_wg_items;
CREATE POLICY "pipeline_wg_items_delete" ON public.pipeline_wg_items
  FOR DELETE USING (true);

-- ============================================================================
-- 5. CRIAR TABELA evf_estudos_itens
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.evf_estudos_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudo_id UUID NOT NULL, -- FK para evf_estudos (se existir)
  tipo TEXT NOT NULL, -- 'receita', 'custo', 'investimento'
  categoria TEXT,
  descricao TEXT NOT NULL,
  valor NUMERIC(14,2) DEFAULT 0,
  quantidade NUMERIC(12,4) DEFAULT 1,
  valor_total NUMERIC(14,2) GENERATED ALWAYS AS (valor * quantidade) STORED,
  mes_inicio INTEGER DEFAULT 1,
  mes_fim INTEGER,
  recorrente BOOLEAN DEFAULT false,
  observacoes TEXT,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_evf_estudos_itens_estudo ON public.evf_estudos_itens(estudo_id);
CREATE INDEX IF NOT EXISTS idx_evf_estudos_itens_tipo ON public.evf_estudos_itens(tipo);

-- RLS
ALTER TABLE public.evf_estudos_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evf_estudos_itens_select" ON public.evf_estudos_itens;
CREATE POLICY "evf_estudos_itens_select" ON public.evf_estudos_itens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "evf_estudos_itens_insert" ON public.evf_estudos_itens;
CREATE POLICY "evf_estudos_itens_insert" ON public.evf_estudos_itens
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "evf_estudos_itens_update" ON public.evf_estudos_itens;
CREATE POLICY "evf_estudos_itens_update" ON public.evf_estudos_itens
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "evf_estudos_itens_delete" ON public.evf_estudos_itens;
CREATE POLICY "evf_estudos_itens_delete" ON public.evf_estudos_itens
  FOR DELETE USING (true);

-- ============================================================================
-- 6. ENRIQUECER TABELA propostas COM COLUNAS FALTANTES
-- ============================================================================
DO $$
BEGIN
  -- numero
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'numero'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN numero TEXT;
  END IF;

  -- titulo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'titulo'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN titulo TEXT;
  END IF;

  -- oportunidade_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'oportunidade_id'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN oportunidade_id UUID REFERENCES public.oportunidades(id);
  END IF;

  -- data_validade
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'data_validade'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN data_validade DATE;
  END IF;

  -- observacoes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN observacoes TEXT;
  END IF;

  -- criado_por
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'criado_por'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN criado_por UUID REFERENCES public.pessoas(id);
  END IF;

  -- atualizado_em
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'atualizado_em'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT now();
  END IF;

  -- enviado_em
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'enviado_em'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN enviado_em TIMESTAMPTZ;
  END IF;

  -- aprovado_em
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'aprovado_em'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN aprovado_em TIMESTAMPTZ;
  END IF;

  -- rejeitado_em
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'rejeitado_em'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN rejeitado_em TIMESTAMPTZ;
  END IF;

  -- motivo_rejeicao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'motivo_rejeicao'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN motivo_rejeicao TEXT;
  END IF;

  -- link_aprovacao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'link_aprovacao'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN link_aprovacao TEXT;
  END IF;

  -- nucleo (ARQUITETURA, ENGENHARIA, MARCENARIA)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'nucleo'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN nucleo TEXT;
  END IF;

  -- contrato_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'contrato_id'
  ) THEN
    ALTER TABLE public.propostas ADD COLUMN contrato_id UUID REFERENCES public.contratos(id);
  END IF;

  RAISE NOTICE 'Tabela propostas enriquecida com colunas faltantes';
END $$;

-- ============================================================================
-- 7. CRIAR/CORRIGIR VIEW pipeline_wg_view
-- ============================================================================
DROP VIEW IF EXISTS public.pipeline_wg_view;

CREATE VIEW public.pipeline_wg_view AS
SELECT
  p.id,
  p.titulo,
  p.descricao,
  p.estagio,
  p.valor_estimado,
  p.probabilidade,
  p.cliente_id,
  c.nome AS cliente_nome,
  p.responsavel_id,
  r.nome AS responsavel_nome,
  p.oportunidade_id,
  p.contrato_id,
  p.data_previsao_fechamento,
  p.data_fechamento,
  p.motivo_perda,
  p.fonte,
  p.tags,
  p.prioridade,
  p.ordem,
  p.criado_em,
  p.atualizado_em
FROM public.pipeline_wg_items p
LEFT JOIN public.pessoas c ON c.id = p.cliente_id
LEFT JOIN public.pessoas r ON r.id = p.responsavel_id;

GRANT SELECT ON public.pipeline_wg_view TO authenticated;
GRANT SELECT ON public.pipeline_wg_view TO anon;

-- ============================================================================
-- 8. CRIAR/CORRIGIR VIEW vw_propostas_ambientes_resumo
-- ============================================================================
DROP VIEW IF EXISTS public.vw_propostas_ambientes_resumo;

CREATE VIEW public.vw_propostas_ambientes_resumo AS
SELECT
  pa.id,
  pa.proposta_id,
  pa.nome,
  pa.descricao,
  pa.area_m2,
  pa.valor_subtotal,
  pa.ordem,
  p.titulo AS proposta_titulo,
  p.status AS proposta_status,
  cli.nome AS cliente_nome,
  COUNT(pi.id) AS total_itens,
  COALESCE(SUM(pi.valor_total), 0) AS valor_itens
FROM public.propostas_ambientes pa
LEFT JOIN public.propostas p ON p.id = pa.proposta_id
LEFT JOIN public.pessoas cli ON cli.id = p.cliente_id
LEFT JOIN public.propostas_itens pi ON pi.ambiente_id = pa.id
GROUP BY pa.id, pa.proposta_id, pa.nome, pa.descricao, pa.area_m2, pa.valor_subtotal, pa.ordem,
         p.titulo, p.status, cli.nome;

GRANT SELECT ON public.vw_propostas_ambientes_resumo TO authenticated;
GRANT SELECT ON public.vw_propostas_ambientes_resumo TO anon;

-- ============================================================================
-- 9. CRIAR/CORRIGIR VIEW view_propostas_totais_ambientes
-- ============================================================================
DROP VIEW IF EXISTS public.view_propostas_totais_ambientes;

CREATE VIEW public.view_propostas_totais_ambientes AS
SELECT
  p.id AS proposta_id,
  p.titulo,
  p.status,
  p.cliente_id,
  cli.nome AS cliente_nome,
  COUNT(DISTINCT pa.id) AS total_ambientes,
  COUNT(pi.id) AS total_itens,
  COALESCE(SUM(pi.valor_total), 0) AS valor_total_itens,
  p.valor_total AS valor_proposta
FROM public.propostas p
LEFT JOIN public.pessoas cli ON cli.id = p.cliente_id
LEFT JOIN public.propostas_ambientes pa ON pa.proposta_id = p.id
LEFT JOIN public.propostas_itens pi ON pi.proposta_id = p.id
GROUP BY p.id, p.titulo, p.status, p.cliente_id, cli.nome, p.valor_total;

GRANT SELECT ON public.view_propostas_totais_ambientes TO authenticated;
GRANT SELECT ON public.view_propostas_totais_ambientes TO anon;

-- ============================================================================
-- 10. CRIAR/CORRIGIR VIEW view_propostas_totais_por_nucleo
-- ============================================================================
DROP VIEW IF EXISTS public.view_propostas_totais_por_nucleo;

CREATE VIEW public.view_propostas_totais_por_nucleo AS
SELECT
  p.id AS proposta_id,
  p.titulo,
  p.status,
  p.nucleo,
  p.cliente_id,
  cli.nome AS cliente_nome,
  COUNT(pi.id) AS total_itens,
  COALESCE(SUM(pi.valor_total), 0) AS valor_total_itens,
  p.valor_total AS valor_proposta
FROM public.propostas p
LEFT JOIN public.pessoas cli ON cli.id = p.cliente_id
LEFT JOIN public.propostas_itens pi ON pi.proposta_id = p.id AND pi.nucleo = p.nucleo
GROUP BY p.id, p.titulo, p.status, p.nucleo, p.cliente_id, cli.nome, p.valor_total;

GRANT SELECT ON public.view_propostas_totais_por_nucleo TO authenticated;
GRANT SELECT ON public.view_propostas_totais_por_nucleo TO anon;

-- ============================================================================
-- 11. CRIAR/CORRIGIR VIEW vw_orcamentos_pendentes_aprovacao
-- ============================================================================
DROP VIEW IF EXISTS public.vw_orcamentos_pendentes_aprovacao;

-- Primeiro, adicionar colunas faltantes à tabela orcamentos se necessário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orcamentos' AND column_name = 'numero'
  ) THEN
    ALTER TABLE public.orcamentos ADD COLUMN numero TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orcamentos' AND column_name = 'titulo'
  ) THEN
    ALTER TABLE public.orcamentos ADD COLUMN titulo TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orcamentos' AND column_name = 'atualizado_em'
  ) THEN
    ALTER TABLE public.orcamentos ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

CREATE VIEW public.vw_orcamentos_pendentes_aprovacao AS
SELECT
  o.id,
  o.numero,
  o.titulo,
  o.status,
  o.valor_total,
  o.cliente_id,
  cli.nome AS cliente_nome,
  o.criado_em,
  o.atualizado_em,
  COUNT(oi.id) AS total_itens,
  COALESCE(SUM(oi.valor_total), 0) AS valor_itens
FROM public.orcamentos o
LEFT JOIN public.pessoas cli ON cli.id = o.cliente_id
LEFT JOIN public.orcamento_itens oi ON oi.orcamento_id = o.id
WHERE o.status IN ('pendente', 'aguardando_aprovacao', 'em_analise')
GROUP BY o.id, o.numero, o.titulo, o.status, o.valor_total, o.cliente_id, cli.nome,
         o.criado_em, o.atualizado_em;

GRANT SELECT ON public.vw_orcamentos_pendentes_aprovacao TO authenticated;
GRANT SELECT ON public.vw_orcamentos_pendentes_aprovacao TO anon;

-- ============================================================================
-- 12. CRIAR/CORRIGIR VIEW vw_evf_estudos_completos
-- ============================================================================
DROP VIEW IF EXISTS public.vw_evf_estudos_completos;

-- Primeiro, adicionar colunas faltantes à tabela evf_estudos se necessário
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'evf_estudos'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'evf_estudos' AND column_name = 'titulo'
    ) THEN
      ALTER TABLE public.evf_estudos ADD COLUMN titulo TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'evf_estudos' AND column_name = 'descricao'
    ) THEN
      ALTER TABLE public.evf_estudos ADD COLUMN descricao TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'evf_estudos' AND column_name = 'status'
    ) THEN
      ALTER TABLE public.evf_estudos ADD COLUMN status TEXT DEFAULT 'rascunho';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'evf_estudos' AND column_name = 'oportunidade_id'
    ) THEN
      ALTER TABLE public.evf_estudos ADD COLUMN oportunidade_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'evf_estudos' AND column_name = 'cliente_id'
    ) THEN
      ALTER TABLE public.evf_estudos ADD COLUMN cliente_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'evf_estudos' AND column_name = 'atualizado_em'
    ) THEN
      ALTER TABLE public.evf_estudos ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT now();
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'evf_estudos' AND column_name = 'criado_em'
    ) THEN
      ALTER TABLE public.evf_estudos ADD COLUMN criado_em TIMESTAMPTZ DEFAULT now();
    END IF;

    RAISE NOTICE 'Tabela evf_estudos enriquecida';
  ELSE
    -- Se a tabela não existe, criar ela
    CREATE TABLE public.evf_estudos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      titulo TEXT,
      descricao TEXT,
      status TEXT DEFAULT 'rascunho',
      oportunidade_id UUID,
      cliente_id UUID REFERENCES public.pessoas(id),
      criado_em TIMESTAMPTZ DEFAULT now(),
      atualizado_em TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE public.evf_estudos ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "evf_estudos_select" ON public.evf_estudos FOR SELECT USING (true);
    CREATE POLICY "evf_estudos_insert" ON public.evf_estudos FOR INSERT WITH CHECK (true);
    CREATE POLICY "evf_estudos_update" ON public.evf_estudos FOR UPDATE USING (true);
    CREATE POLICY "evf_estudos_delete" ON public.evf_estudos FOR DELETE USING (true);

    RAISE NOTICE 'Tabela evf_estudos criada';
  END IF;
END $$;

CREATE VIEW public.vw_evf_estudos_completos AS
SELECT
  e.id,
  e.titulo,
  e.descricao,
  e.status,
  e.oportunidade_id,
  e.cliente_id,
  cli.nome AS cliente_nome,
  e.criado_em,
  e.atualizado_em,
  COUNT(DISTINCT ei.id) FILTER (WHERE ei.tipo = 'receita') AS total_receitas,
  COUNT(DISTINCT ei.id) FILTER (WHERE ei.tipo = 'custo') AS total_custos,
  COUNT(DISTINCT ei.id) FILTER (WHERE ei.tipo = 'investimento') AS total_investimentos,
  COALESCE(SUM(ei.valor_total) FILTER (WHERE ei.tipo = 'receita'), 0) AS valor_total_receitas,
  COALESCE(SUM(ei.valor_total) FILTER (WHERE ei.tipo = 'custo'), 0) AS valor_total_custos,
  COALESCE(SUM(ei.valor_total) FILTER (WHERE ei.tipo = 'investimento'), 0) AS valor_total_investimentos
FROM public.evf_estudos e
LEFT JOIN public.pessoas cli ON cli.id = e.cliente_id
LEFT JOIN public.evf_estudos_itens ei ON ei.estudo_id = e.id
GROUP BY e.id, e.titulo, e.descricao, e.status, e.oportunidade_id, e.cliente_id, cli.nome,
         e.criado_em, e.atualizado_em;

GRANT SELECT ON public.vw_evf_estudos_completos TO authenticated;
GRANT SELECT ON public.vw_evf_estudos_completos TO anon;

-- ============================================================================
-- 13. VERIFICAÇÃO FINAL
-- ============================================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Contar tabelas criadas
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('orcamento_itens', 'propostas_ambientes', 'propostas_itens',
                       'pipeline_wg_items', 'evf_estudos_itens');

  RAISE NOTICE '% tabelas criadas/verificadas', v_count;

  -- Contar views criadas
  SELECT COUNT(*) INTO v_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN ('pipeline_wg_view', 'vw_propostas_ambientes_resumo',
                       'view_propostas_totais_ambientes', 'view_propostas_totais_por_nucleo',
                       'vw_orcamentos_pendentes_aprovacao', 'vw_evf_estudos_completos');

  RAISE NOTICE '% views criadas/verificadas', v_count;
END $$;
