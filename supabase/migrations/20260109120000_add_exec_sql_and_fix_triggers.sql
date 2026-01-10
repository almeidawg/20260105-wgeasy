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

-- ============================================================
-- 7. Adicionar coluna nucleo em financeiro_juridico
-- ============================================================

ALTER TABLE financeiro_juridico ADD COLUMN IF NOT EXISTS nucleo TEXT;

-- ============================================================
-- 8. Atualizar view vw_financeiro_juridico_detalhado
-- ============================================================

CREATE OR REPLACE VIEW vw_financeiro_juridico_detalhado AS
SELECT
  fj.id,
  fj.assistencia_id,
  fj.contrato_id,
  fj.tipo,
  fj.natureza,
  fj.descricao,
  fj.observacoes,
  fj.valor,
  fj.valor_pago,
  fj.data_competencia,
  fj.data_vencimento,
  fj.data_pagamento,
  fj.status,
  fj.parcela_atual,
  fj.total_parcelas,
  fj.pessoa_id,
  fj.empresa_id,
  fj.nucleo,
  fj.sincronizado_financeiro,
  fj.financeiro_lancamento_id,
  fj.criado_por,
  fj.atualizado_por,
  fj.created_at,
  fj.updated_at,
  -- Dados da pessoa
  p.nome AS pessoa_nome,
  p.tipo AS pessoa_tipo,
  p.cpf AS pessoa_cpf,
  p.cnpj AS pessoa_cnpj,
  -- Dados da empresa (se aplicável)
  pe.nome AS empresa_nome,
  -- Dados da assistência jurídica
  aj.titulo AS assistencia_titulo,
  aj.numero_processo,
  -- Dados do contrato
  c.numero AS contrato_numero,
  -- Cálculo de dias de atraso
  CASE
    WHEN fj.status IN ('PENDENTE', 'ATRASADO') AND fj.data_vencimento < CURRENT_DATE
    THEN (CURRENT_DATE - fj.data_vencimento::date)::integer
    ELSE 0
  END AS dias_atraso
FROM financeiro_juridico fj
LEFT JOIN pessoas p ON fj.pessoa_id = p.id
LEFT JOIN pessoas pe ON fj.empresa_id = pe.id
LEFT JOIN assistencia_juridica aj ON fj.assistencia_id = aj.id
LEFT JOIN contratos c ON fj.contrato_id = c.id;

-- Grant permissões
GRANT SELECT ON vw_financeiro_juridico_detalhado TO authenticated;
GRANT SELECT ON vw_financeiro_juridico_detalhado TO anon;
