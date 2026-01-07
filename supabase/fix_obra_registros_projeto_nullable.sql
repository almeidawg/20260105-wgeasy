-- ============================================================================
-- FIX: Tornar projeto_id nullable na tabela obra_registros
-- ============================================================================
-- Problema: A API envia cliente_id diretamente, não mais projeto_id.
-- A coluna projeto_id tem constraint NOT NULL que precisa ser removida.
-- ============================================================================

-- 1. Alterar coluna projeto_id para permitir NULL
ALTER TABLE obra_registros
ALTER COLUMN projeto_id DROP NOT NULL;

-- 2. Verificar estrutura atualizada
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'obra_registros'
ORDER BY ordinal_position;

-- 3. Confirmar alteração
SELECT 'projeto_id agora permite NULL' as status;
