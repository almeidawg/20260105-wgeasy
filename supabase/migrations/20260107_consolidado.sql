-- ============================================================
-- MIGRATION: Consolidar tabelas juridico + ajustes notificacoes
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

-- ============================================================
-- FUNCOES AUXILIARES
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABELA: juridico_modelos_contrato
-- ============================================================
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

-- FKs opcionais (evita erro se tabelas ainda nao existirem)
-- Constraints já existentes não serão recriadas

DROP TRIGGER IF EXISTS trigger_juridico_modelos_contrato_updated_at
  ON juridico_modelos_contrato;
CREATE TRIGGER trigger_juridico_modelos_contrato_updated_at
  BEFORE UPDATE ON juridico_modelos_contrato
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- ============================================================
-- TABELA: juridico_variaveis
-- ============================================================
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

-- ============================================================
-- TABELA: juridico_clausulas
-- ============================================================
CREATE TABLE IF NOT EXISTS juridico_clausulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  conteudo_html TEXT NOT NULL,
  variaveis JSONB,
  numero_ordem INTEGER,
  obrigatoria BOOLEAN DEFAULT FALSE,
  ativa BOOLEAN DEFAULT TRUE,
  nucleo TEXT,
  modelo_id UUID,
  criado_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_juridico_clausulas_modelo_id
  ON juridico_clausulas(modelo_id);
CREATE INDEX IF NOT EXISTS idx_juridico_clausulas_nucleo
  ON juridico_clausulas(nucleo);

-- FKs opcionais (evita erro se tabelas ainda nao existirem)
-- Constraints já existentes não serão recriadas

DROP TRIGGER IF EXISTS trigger_juridico_clausulas_updated_at
  ON juridico_clausulas;
CREATE TRIGGER trigger_juridico_clausulas_updated_at
  BEFORE UPDATE ON juridico_clausulas
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- ============================================================
-- TABELA: juridico_versoes_modelo
-- ============================================================
CREATE TABLE IF NOT EXISTS juridico_versoes_modelo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id UUID,
  versao INTEGER NOT NULL,
  versao_texto TEXT,
  conteudo_html TEXT NOT NULL,
  clausulas JSONB,
  variaveis_obrigatorias JSONB,
  motivo_alteracao TEXT,
  alterado_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_juridico_versoes_modelo_modelo_id
  ON juridico_versoes_modelo(modelo_id);

-- FKs opcionais (evita erro se tabelas ainda nao existirem)
-- Constraints já existentes não serão recriadas

-- ============================================================
-- TABELA: juridico_memorial_executivo
-- ============================================================
CREATE TABLE IF NOT EXISTS juridico_memorial_executivo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID,
  arquitetura JSONB,
  engenharia JSONB,
  marcenaria JSONB,
  materiais JSONB,
  produtos JSONB,
  texto_clausula_objeto TEXT,
  snapshot_data JSONB,
  snapshot_gerado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_juridico_memorial_executivo_contrato_id
  ON juridico_memorial_executivo(contrato_id);

-- FK opcional (evita erro se a tabela ainda nao existir)
-- Constraints já existentes não serão recriadas

DROP TRIGGER IF EXISTS trigger_juridico_memorial_executivo_updated_at
  ON juridico_memorial_executivo;
CREATE TRIGGER trigger_juridico_memorial_executivo_updated_at
  BEFORE UPDATE ON juridico_memorial_executivo
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- ============================================================
-- TABELA: juridico_auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS juridico_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade TEXT NOT NULL,
  entidade_id TEXT NOT NULL,
  acao TEXT NOT NULL,
  dados_antes JSONB,
  dados_depois JSONB,
  usuario_id UUID,
  usuario_nome TEXT,
  usuario_perfil TEXT,
  ip_address TEXT,
  user_agent TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_juridico_auditoria_entidade
  ON juridico_auditoria(entidade);
CREATE INDEX IF NOT EXISTS idx_juridico_auditoria_entidade_id
  ON juridico_auditoria(entidade_id);

-- FK opcional (evita erro se a tabela ainda nao existir)
-- Constraints já existentes não serão recriadas

-- ============================================================
-- NOTIFICACOES: referencias genericas
-- ============================================================
ALTER TABLE IF EXISTS notificacoes
  ADD COLUMN IF NOT EXISTS referencia_tipo TEXT,
  ADD COLUMN IF NOT EXISTS referencia_id UUID;
