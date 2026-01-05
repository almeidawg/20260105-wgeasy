-- ============================================================
-- ADICIONAR CAMPO: cliente_centro_custo_id
-- Sistema WG Easy - Grupo WG Almeida
--
-- Permite vincular lançamentos financeiros diretamente a um
-- Cliente como Centro de Custo, sem precisar de contrato ativo.
--
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Adicionar coluna cliente_centro_custo_id
ALTER TABLE financeiro_lancamentos
ADD COLUMN IF NOT EXISTS cliente_centro_custo_id UUID REFERENCES pessoas(id) ON DELETE SET NULL;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_cliente_centro_custo
ON financeiro_lancamentos(cliente_centro_custo_id);

-- 3. Comentário explicativo
COMMENT ON COLUMN financeiro_lancamentos.cliente_centro_custo_id IS
'Cliente vinculado diretamente como Centro de Custo (sem contrato). Usar quando não há contrato ativo.';

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'financeiro_lancamentos'
AND column_name IN ('contrato_id', 'pessoa_id', 'cliente_centro_custo_id')
ORDER BY column_name;
