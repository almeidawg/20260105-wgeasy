-- ============================================================
-- MIGRATION: Adicionar campo status na tabela pessoas
-- Para filtrar clientes/colaboradores concluídos das buscas
-- Data: 2026-01-07 10:01:00
-- ============================================================

-- Adicionar coluna status na tabela pessoas
ALTER TABLE pessoas
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ativo';

-- Comentário explicativo
COMMENT ON COLUMN pessoas.status IS 'Status da pessoa: ativo, concluido, inativo, suspenso';

-- Criar índice para melhorar performance das buscas por status
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON pessoas(status);

-- Criar índice composto para buscas por tipo + status (muito comum)
CREATE INDEX IF NOT EXISTS idx_pessoas_tipo_status ON pessoas(tipo, status);

-- Atualizar registros existentes:
-- Clientes com contratos concluídos = 'concluido'
-- Demais = 'ativo'
UPDATE pessoas p
SET status = 'concluido'
WHERE p.tipo = 'CLIENTE'
  AND p.status IS NULL
  AND EXISTS (
    SELECT 1 FROM contratos c
    WHERE c.cliente_id = p.id
    AND c.status = 'concluido'
    AND NOT EXISTS (
      SELECT 1 FROM contratos c2
      WHERE c2.cliente_id = p.id
      AND c2.status IN ('ativo', 'em_andamento')
    )
  );

-- Garantir que registros sem status definido fiquem como 'ativo'
UPDATE pessoas SET status = 'ativo' WHERE status IS NULL;
