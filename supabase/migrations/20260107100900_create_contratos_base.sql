-- ============================================================
-- MIGRATION: Criar estrutura base de contratos (modulo juridico)
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

-- ============================================================
-- FUNCOES AUXILIARES
-- ============================================================
CREATE OR REPLACE FUNCTION contratos_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION contratos_calcular_data_termino(
  p_data_inicio DATE,
  p_duracao_dias_uteis INTEGER
)
RETURNS DATE AS $$
DECLARE
  data_atual DATE;
  dias_contados INTEGER := 0;
BEGIN
  data_atual := p_data_inicio;

  WHILE dias_contados < p_duracao_dias_uteis LOOP
    data_atual := data_atual + 1;
    IF EXTRACT(DOW FROM data_atual) NOT IN (0, 6) THEN
      dias_contados := dias_contados + 1;
    END IF;
  END LOOP;

  RETURN data_atual;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION contratos_gerar_numero()
RETURNS TEXT AS $$
DECLARE
  ano TEXT;
  sequencia INTEGER;
BEGIN
  ano := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

  SELECT COALESCE(MAX(
    CASE
      WHEN numero ~ ('^CONT-' || ano || '-[0-9]+$')
      THEN SUBSTRING(numero FROM 'CONT-' || ano || '-([0-9]+)$')::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequencia
  FROM public.contratos
  WHERE numero LIKE 'CONT-' || ano || '-%';

  RETURN 'CONT-' || ano || '-' || LPAD(sequencia::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION contratos_preencher_campos()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    NEW.numero := contratos_gerar_numero();
  END IF;

  IF NEW.data_inicio IS NOT NULL AND NEW.duracao_dias_uteis IS NOT NULL THEN
    NEW.data_previsao_termino := contratos_calcular_data_termino(
      NEW.data_inicio,
      NEW.duracao_dias_uteis
    );
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABELA: contratos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE,
  codigo TEXT,
  titulo TEXT,
  descricao TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aguardando_assinatura', 'ativo', 'concluido', 'cancelado')),
  unidade_negocio TEXT CHECK (unidade_negocio IN ('arquitetura', 'engenharia', 'marcenaria', 'moma_engenharia', 'moma_planejados')),
  nucleo TEXT,
  nucleo_id UUID,
  nucleos_selecionados TEXT[],
  cliente_id UUID,
  proposta_id UUID,
  oportunidade_id UUID,
  obra_id UUID,
  cronograma_id UUID,
  empresa_id UUID,
  memorial_executivo_id UUID,
  modelo_juridico_id UUID,
  contrato_grupo_id UUID,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  data_inicio DATE,
  data_fim DATE,
  data_previsao_termino DATE,
  data_termino_real DATE,
  data_assinatura TIMESTAMPTZ,
  duracao_dias_uteis INTEGER,
  forma_pagamento TEXT,
  numero_parcelas INTEGER,
  percentual_entrada NUMERIC,
  valor_entrada NUMERIC,
  valor_parcela NUMERIC,
  valor_total NUMERIC,
  valor_mao_obra NUMERIC,
  valor_materiais NUMERIC,
  financeiro_modo TEXT,
  financeiro_observacoes TEXT,
  tipo_financeiro TEXT,
  antecipar_recebimento BOOLEAN,
  taxa_antecipacao NUMERIC,
  documento_url TEXT,
  assinatura_cliente_base64 TEXT,
  assinatura_responsavel_base64 TEXT,
  dados_cliente_json JSONB,
  dados_imovel_json JSONB,
  condicoes_contratuais TEXT,
  observacoes TEXT,
  conteudo_gerado TEXT,
  snapshot_modelo JSONB,
  versao_modelo INTEGER,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir coluna unidade_negocio quando tabela ja existe
DO $$
BEGIN
  IF to_regclass('public.contratos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'unidade_negocio'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN unidade_negocio TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'cliente_id'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN cliente_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'proposta_id'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN proposta_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'oportunidade_id'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN oportunidade_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'obra_id'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN obra_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'empresa_id'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN empresa_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'memorial_executivo_id'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN memorial_executivo_id UUID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'modelo_juridico_id'
    ) THEN
      ALTER TABLE public.contratos
        ADD COLUMN modelo_juridico_id UUID;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON public.contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON public.contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_unidade_negocio ON public.contratos(unidade_negocio);
CREATE INDEX IF NOT EXISTS idx_contratos_created_at ON public.contratos(created_at DESC);

DROP TRIGGER IF EXISTS trigger_contratos_set_updated_at ON public.contratos;
CREATE TRIGGER trigger_contratos_set_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION contratos_set_updated_at();

DROP TRIGGER IF EXISTS trigger_contratos_preencher_campos ON public.contratos;
CREATE TRIGGER trigger_contratos_preencher_campos
  BEFORE INSERT OR UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION contratos_preencher_campos();

-- ============================================================
-- FKS OPCIONAIS
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.pessoas') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contratos_cliente_id_fkey'
        AND conrelid = 'public.contratos'::regclass
    ) THEN
      ALTER TABLE public.contratos
        ADD CONSTRAINT contratos_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.propostas') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contratos_proposta_id_fkey'
        AND conrelid = 'public.contratos'::regclass
    ) THEN
      ALTER TABLE public.contratos
        ADD CONSTRAINT contratos_proposta_id_fkey
        FOREIGN KEY (proposta_id) REFERENCES public.propostas(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.oportunidades') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contratos_oportunidade_id_fkey'
        AND conrelid = 'public.contratos'::regclass
    ) THEN
      ALTER TABLE public.contratos
        ADD CONSTRAINT contratos_oportunidade_id_fkey
        FOREIGN KEY (oportunidade_id) REFERENCES public.oportunidades(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.obras') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contratos_obra_id_fkey'
        AND conrelid = 'public.contratos'::regclass
    ) THEN
      ALTER TABLE public.contratos
        ADD CONSTRAINT contratos_obra_id_fkey
        FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.empresas') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contratos_empresa_id_fkey'
        AND conrelid = 'public.contratos'::regclass
    ) THEN
      ALTER TABLE public.contratos
        ADD CONSTRAINT contratos_empresa_id_fkey
        FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.juridico_memorial_executivo') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contratos_memorial_executivo_id_fkey'
        AND conrelid = 'public.contratos'::regclass
    ) THEN
      ALTER TABLE public.contratos
        ADD CONSTRAINT contratos_memorial_executivo_id_fkey
        FOREIGN KEY (memorial_executivo_id) REFERENCES public.juridico_memorial_executivo(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF to_regclass('public.juridico_modelos_contrato') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contratos_modelo_juridico_id_fkey'
        AND conrelid = 'public.contratos'::regclass
    ) THEN
      ALTER TABLE public.contratos
        ADD CONSTRAINT contratos_modelo_juridico_id_fkey
        FOREIGN KEY (modelo_juridico_id) REFERENCES public.juridico_modelos_contrato(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ============================================================
-- TABELA: contrato_parcelas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contrato_parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL,
  numero_parcela INTEGER NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  forma_pagamento TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT contrato_parcelas_unique UNIQUE (contrato_id, numero_parcela)
);

CREATE INDEX IF NOT EXISTS idx_contrato_parcelas_contrato_id ON public.contrato_parcelas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_contrato_parcelas_vencimento ON public.contrato_parcelas(data_vencimento);

-- ============================================================
-- TABELA: contrato_aditivos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contrato_aditivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL,
  numero_aditivo INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('valor', 'prazo', 'escopo', 'misto')),
  descricao TEXT NOT NULL,
  valor_adicional NUMERIC DEFAULT 0,
  dias_adicionais INTEGER DEFAULT 0,
  nova_previsao_termino DATE,
  data_assinatura DATE,
  arquivo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FKS E TRIGGERS PARA PARCELAS/ADITIVOS
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.contratos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contrato_parcelas_contrato_id_fkey'
        AND conrelid = 'public.contrato_parcelas'::regclass
    ) THEN
      ALTER TABLE public.contrato_parcelas
        ADD CONSTRAINT contrato_parcelas_contrato_id_fkey
        FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contrato_aditivos_contrato_id_fkey'
        AND conrelid = 'public.contrato_aditivos'::regclass
    ) THEN
      ALTER TABLE public.contrato_aditivos
        ADD CONSTRAINT contrato_aditivos_contrato_id_fkey
        FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trigger_contrato_parcelas_set_updated_at ON public.contrato_parcelas;
CREATE TRIGGER trigger_contrato_parcelas_set_updated_at
  BEFORE UPDATE ON public.contrato_parcelas
  FOR EACH ROW
  EXECUTE FUNCTION contratos_set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_aditivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados podem ver contratos"
  ON public.contratos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem inserir contratos"
  ON public.contratos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem atualizar contratos"
  ON public.contratos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem ver parcelas"
  ON public.contrato_parcelas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem gerenciar parcelas"
  ON public.contrato_parcelas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem ver aditivos"
  ON public.contrato_aditivos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem gerenciar aditivos"
  ON public.contrato_aditivos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
