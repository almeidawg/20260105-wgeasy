-- =============================================
-- SCRIPT: Adicionar campo favorecido_id na tabela financeiro_lancamentos
-- Objetivo: Permitir registrar quem recebe o pagamento (favorecido)
-- Data: 2026-01-02
-- =============================================

-- 1. Adicionar coluna favorecido_id com FK para pessoas
ALTER TABLE financeiro_lancamentos
ADD COLUMN IF NOT EXISTS favorecido_id UUID;

-- 2. Criar a Foreign Key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_lancamentos_favorecido_id_fkey'
    ) THEN
        ALTER TABLE financeiro_lancamentos
        ADD CONSTRAINT financeiro_lancamentos_favorecido_id_fkey
        FOREIGN KEY (favorecido_id) REFERENCES pessoas(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_favorecido_id
ON financeiro_lancamentos(favorecido_id);

-- 4. Comentário explicativo na coluna
COMMENT ON COLUMN financeiro_lancamentos.favorecido_id IS 'ID da pessoa que recebe o pagamento (favorecido)';

-- =============================================
-- VERIFICAÇÃO: Confirmar que a coluna foi criada
-- =============================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'financeiro_lancamentos'
  AND column_name = 'favorecido_id';

-- =============================================
-- Listar todas as FKs da tabela (verificação)
-- =============================================
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'financeiro_lancamentos'
  AND tc.constraint_type = 'FOREIGN KEY';
