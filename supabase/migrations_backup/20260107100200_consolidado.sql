-- ============================================================
-- MIGRATION: Consolidar tabelas juridico + ajustes notificacoes
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07 10:02:00
-- ============================================================

-- FUNCOES AUXILIARES
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TABELA: juridico_modelos_contrato
CREATE TABLE IF NOT EXISTS juridico_modelos_contrato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  empresa_id UUID,
  nucleo TEXT NOT NULL DEFAULT 'geral',
  conteudo_html TEXT NOT NULL,
  clausulas JSONB,
  variaveis_obrigatorias JSONB,
  prazo_execucao_padrao INTEGER,
  prorrogacao_padrao INTEGER,
  status TEXT DEFAULT 'rascunho',
  versao INTEGER DEFAULT 1,
  versao_texto TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_por UUID,
  aprovado_por UUID,
  data_aprovacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_juridico_modelos_contrato_nucleo
  ON juridico_modelos_contrato(nucleo);
CREATE INDEX IF NOT EXISTS idx_juridico_modelos_contrato_status
  ON juridico_modelos_contrato(status);
CREATE INDEX IF NOT EXISTS idx_juridico_modelos_contrato_ativo
  ON juridico_modelos_contrato(ativo);
CREATE INDEX IF NOT EXISTS idx_juridico_modelos_contrato_updated_at
  ON juridico_modelos_contrato(updated_at DESC);

DO $$
BEGIN
  IF to_regclass('public.empresas') IS NOT NULL THEN
    ALTER TABLE juridico_modelos_contrato
      ADD CONSTRAINT juridico_modelos_contrato_empresa_id_fkey
      FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL;
  END IF;
  IF to_regclass('public.usuarios') IS NOT NULL THEN
    ALTER TABLE juridico_modelos_contrato
      ADD CONSTRAINT juridico_modelos_contrato_criado_por_fkey
      FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL;
    ALTER TABLE juridico_modelos_contrato
      ADD CONSTRAINT juridico_modelos_contrato_aprovado_por_fkey
      FOREIGN KEY (aprovado_por) REFERENCES usuarios(id) ON DELETE SET NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trigger_juridico_modelos_contrato_updated_at
  ON juridico_modelos_contrato;
CREATE TRIGGER trigger_juridico_modelos_contrato_updated_at
  BEFORE UPDATE ON juridico_modelos_contrato
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- TABELA: juridico_variaveis
CREATE TABLE IF NOT EXISTS juridico_variaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  exemplo TEXT,
  formato TEXT,
  tabela_origem TEXT,
  campo_origem TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_juridico_variaveis_categoria
  ON juridico_variaveis(categoria);
CREATE INDEX IF NOT EXISTS idx_juridico_variaveis_ativa
  ON juridico_variaveis(ativa);
