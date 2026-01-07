-- ============================================================================
-- FIX: Adicionar FK cliente_id na tabela obra_registros
-- ============================================================================
-- Problema: A API diarioObraApi.ts usa a FK obra_registros_cliente_id_fkey
-- que nao existe no schema atual.
--
-- Erro: "Could not find a relationship between 'obra_registros' and 'pessoas'"
-- ============================================================================

-- 1. Verificar se a coluna cliente_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'obra_registros' AND column_name = 'cliente_id'
    ) THEN
        -- Adicionar coluna cliente_id
        ALTER TABLE obra_registros
        ADD COLUMN cliente_id UUID REFERENCES pessoas(id);

        RAISE NOTICE 'Coluna cliente_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna cliente_id ja existe';
    END IF;
END $$;

-- 2. Criar constraint de FK se nao existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'obra_registros_cliente_id_fkey'
        AND table_name = 'obra_registros'
    ) THEN
        -- Adicionar FK constraint
        ALTER TABLE obra_registros
        ADD CONSTRAINT obra_registros_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES pessoas(id);

        RAISE NOTICE 'FK obra_registros_cliente_id_fkey criada com sucesso';
    ELSE
        RAISE NOTICE 'FK obra_registros_cliente_id_fkey ja existe';
    END IF;
END $$;

-- 3. Preencher cliente_id com base no projeto (se projeto_id existir)
-- Obs: projeto_id referencia contratos, que tem cliente_id
UPDATE obra_registros r
SET cliente_id = c.cliente_id
FROM contratos c
WHERE r.projeto_id = c.id
AND r.cliente_id IS NULL
AND c.cliente_id IS NOT NULL;

-- 4. Verificar se a FK colaborador tambem esta correta
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'obra_registros_colaborador_id_fkey'
        AND table_name = 'obra_registros'
    ) THEN
        -- Adicionar FK constraint para colaborador
        ALTER TABLE obra_registros
        ADD CONSTRAINT obra_registros_colaborador_id_fkey
        FOREIGN KEY (colaborador_id) REFERENCES pessoas(id);

        RAISE NOTICE 'FK obra_registros_colaborador_id_fkey criada com sucesso';
    ELSE
        RAISE NOTICE 'FK obra_registros_colaborador_id_fkey ja existe';
    END IF;
END $$;

-- 5. Criar indice para performance
CREATE INDEX IF NOT EXISTS idx_obra_registros_cliente_id ON obra_registros(cliente_id);
CREATE INDEX IF NOT EXISTS idx_obra_registros_colaborador_id ON obra_registros(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_obra_registros_data ON obra_registros(data_registro);

-- 6. Verificar resultado
SELECT
    'obra_registros' as tabela,
    COUNT(*) as total_registros,
    COUNT(cliente_id) as com_cliente,
    COUNT(colaborador_id) as com_colaborador
FROM obra_registros;

-- 7. Mostrar estrutura atual
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'obra_registros'
ORDER BY ordinal_position;

-- 8. Mostrar FKs
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
WHERE tc.table_name = 'obra_registros'
AND tc.constraint_type = 'FOREIGN KEY';
