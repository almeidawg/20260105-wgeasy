-- ============================================================
-- TABELA BASE: PESSOAS (SUPABASE COMPATÍVEL)
-- Execute este script ANTES de criar tabelas que referenciam pessoas
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pessoas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
    -- Adicione outros campos conforme necessário
);
