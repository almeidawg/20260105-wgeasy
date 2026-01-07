-- ============================================================================
-- FIX: Criar RLS Policies para tabela obra_registros
-- ============================================================================
-- Problema: A tabela tem RLS habilitado mas não tem policies definidas,
-- causando erro 42501 ao tentar inserir registros.
-- ============================================================================

-- 1. Garantir que RLS está habilitado
ALTER TABLE obra_registros ENABLE ROW LEVEL SECURITY;

-- 2. Remover policies antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "obra_registros_select" ON obra_registros;
DROP POLICY IF EXISTS "obra_registros_insert" ON obra_registros;
DROP POLICY IF EXISTS "obra_registros_update" ON obra_registros;
DROP POLICY IF EXISTS "obra_registros_delete" ON obra_registros;

-- 3. Policy SELECT - Colaboradores veem registros de seus projetos
CREATE POLICY "obra_registros_select" ON obra_registros
FOR SELECT USING (
    -- Usuarios autenticados podem ver registros
    auth.role() = 'authenticated'
);

-- 4. Policy INSERT - Colaboradores podem criar registros
CREATE POLICY "obra_registros_insert" ON obra_registros
FOR INSERT WITH CHECK (
    -- Usuarios autenticados podem inserir
    auth.role() = 'authenticated'
);

-- 5. Policy UPDATE - Colaboradores podem atualizar registros
CREATE POLICY "obra_registros_update" ON obra_registros
FOR UPDATE USING (
    -- Usuarios autenticados podem atualizar
    auth.role() = 'authenticated'
);

-- 6. Policy DELETE - Colaboradores podem deletar seus registros
CREATE POLICY "obra_registros_delete" ON obra_registros
FOR DELETE USING (
    -- Usuarios autenticados podem deletar
    auth.role() = 'authenticated'
);

-- 7. Também criar policies para obra_registros_fotos se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obra_registros_fotos') THEN
        -- Habilitar RLS
        ALTER TABLE obra_registros_fotos ENABLE ROW LEVEL SECURITY;

        -- Remover policies antigas
        DROP POLICY IF EXISTS "obra_registros_fotos_select" ON obra_registros_fotos;
        DROP POLICY IF EXISTS "obra_registros_fotos_insert" ON obra_registros_fotos;
        DROP POLICY IF EXISTS "obra_registros_fotos_update" ON obra_registros_fotos;
        DROP POLICY IF EXISTS "obra_registros_fotos_delete" ON obra_registros_fotos;

        -- Criar policies
        CREATE POLICY "obra_registros_fotos_select" ON obra_registros_fotos
        FOR SELECT USING (auth.role() = 'authenticated');

        CREATE POLICY "obra_registros_fotos_insert" ON obra_registros_fotos
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "obra_registros_fotos_update" ON obra_registros_fotos
        FOR UPDATE USING (auth.role() = 'authenticated');

        CREATE POLICY "obra_registros_fotos_delete" ON obra_registros_fotos
        FOR DELETE USING (auth.role() = 'authenticated');

        RAISE NOTICE 'Policies para obra_registros_fotos criadas com sucesso';
    END IF;
END $$;

-- 8. Verificar policies criadas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('obra_registros', 'obra_registros_fotos')
ORDER BY tablename, policyname;
