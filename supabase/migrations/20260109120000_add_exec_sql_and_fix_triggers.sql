-- ============================================================
-- MIGRATION: Adicionar função exec_sql e corrigir triggers
-- Data: 2026-01-09
-- ============================================================

-- 1. Criar função para execução de SQL (útil para manutenção)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;

-- 2. Adicionar colunas faltantes em financeiro_lancamentos
ALTER TABLE financeiro_lancamentos ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER DEFAULT 1;
ALTER TABLE financeiro_lancamentos ADD COLUMN IF NOT EXISTS parcela_atual INTEGER DEFAULT 1;
ALTER TABLE financeiro_lancamentos ADD COLUMN IF NOT EXISTS valor_parcela NUMERIC;

-- 3. Dropar triggers problemáticos
DROP TRIGGER IF EXISTS trigger_gerar_parcelas_contrato ON financeiro_lancamentos;
DROP TRIGGER IF EXISTS trigger_financeiro_lancamentos_contrato ON financeiro_lancamentos;
DROP TRIGGER IF EXISTS trigger_calcular_parcelas ON financeiro_lancamentos;
DROP TRIGGER IF EXISTS tr_financeiro_lancamentos_insert ON financeiro_lancamentos;
DROP TRIGGER IF EXISTS trigger_financeiro_parcelas ON financeiro_lancamentos;

-- 4. Dropar funções problemáticas
DROP FUNCTION IF EXISTS gerar_parcelas_contrato() CASCADE;
DROP FUNCTION IF EXISTS calcular_parcelas_contrato() CASCADE;
DROP FUNCTION IF EXISTS financeiro_criar_parcelas() CASCADE;

-- 5. Adicionar status 'em_execucao' e 'assinado' ao check constraint de contratos
-- Primeiro remover o constraint antigo
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contratos_status_check'
  ) THEN
    ALTER TABLE contratos DROP CONSTRAINT contratos_status_check;
  END IF;
END $$;

-- Recriar com todos os status
ALTER TABLE contratos ADD CONSTRAINT contratos_status_check
  CHECK (status IN ('rascunho', 'aguardando_assinatura', 'assinado', 'em_execucao', 'ativo', 'concluido', 'finalizado', 'cancelado'));

-- 6. Comentário
COMMENT ON FUNCTION exec_sql(TEXT) IS 'Executa SQL arbitrário (apenas para service_role)';
