-- ============================================================
-- CORRIGIR RLS: audit_logs
-- Sistema WG Easy - Grupo WG Almeida
--
-- Permite inserção na tabela de auditoria
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        RAISE NOTICE 'Tabela audit_logs não existe, criando...';

        CREATE TABLE public.audit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            table_name TEXT NOT NULL,
            record_id UUID,
            action TEXT NOT NULL,
            old_data JSONB,
            new_data JSONB,
            user_id UUID,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow all for audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Enable insert for audit_logs" ON public.audit_logs;

-- 4. Criar políticas permissivas
CREATE POLICY "audit_logs_select" ON public.audit_logs
    FOR SELECT USING (true);

CREATE POLICY "audit_logs_insert" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_logs_update" ON public.audit_logs
    FOR UPDATE USING (true);

CREATE POLICY "audit_logs_delete" ON public.audit_logs
    FOR DELETE USING (true);

-- 5. Verificação
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'audit_logs';
