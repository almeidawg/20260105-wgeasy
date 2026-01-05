-- ============================================================
-- CORRIGIR RLS: Tabelas identificadas na auditoria 05/01/2026
-- Sistema WG Easy - Grupo WG Almeida
-- Execute no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. NOTIFICAÇÕES
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes') THEN
        CREATE TABLE public.notificacoes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            destinatario_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
            tipo TEXT NOT NULL DEFAULT 'info',
            titulo TEXT NOT NULL,
            mensagem TEXT,
            dados JSONB,
            lida BOOLEAN DEFAULT FALSE,
            lida_em TIMESTAMPTZ,
            link TEXT,
            criado_em TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_notificacoes_destinatario ON public.notificacoes(destinatario_id);
        CREATE INDEX idx_notificacoes_lida ON public.notificacoes(lida);
        CREATE INDEX idx_notificacoes_tipo ON public.notificacoes(tipo);

        RAISE NOTICE 'Tabela notificacoes criada';
    ELSE
        RAISE NOTICE 'Tabela notificacoes já existe';
    END IF;
END $$;

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificacoes_select" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_insert" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_update" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_delete" ON public.notificacoes;
DROP POLICY IF EXISTS "allow_all_notificacoes" ON public.notificacoes;

CREATE POLICY "notificacoes_select" ON public.notificacoes FOR SELECT USING (true);
CREATE POLICY "notificacoes_insert" ON public.notificacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "notificacoes_update" ON public.notificacoes FOR UPDATE USING (true);
CREATE POLICY "notificacoes_delete" ON public.notificacoes FOR DELETE USING (true);

-- ============================================================
-- 2. NOTIFICAÇÕES SISTEMA
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes_sistema') THEN
        CREATE TABLE public.notificacoes_sistema (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            tipo TEXT NOT NULL DEFAULT 'info',
            titulo TEXT NOT NULL,
            mensagem TEXT,
            dados JSONB,
            ativa BOOLEAN DEFAULT TRUE,
            data_inicio TIMESTAMPTZ,
            data_fim TIMESTAMPTZ,
            criado_por UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,
            criado_em TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_notificacoes_sistema_ativa ON public.notificacoes_sistema(ativa);
        CREATE INDEX idx_notificacoes_sistema_tipo ON public.notificacoes_sistema(tipo);

        RAISE NOTICE 'Tabela notificacoes_sistema criada';
    ELSE
        RAISE NOTICE 'Tabela notificacoes_sistema já existe';
    END IF;
END $$;

ALTER TABLE public.notificacoes_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificacoes_sistema_select" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_insert" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_update" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_delete" ON public.notificacoes_sistema;

CREATE POLICY "notificacoes_sistema_select" ON public.notificacoes_sistema FOR SELECT USING (true);
CREATE POLICY "notificacoes_sistema_insert" ON public.notificacoes_sistema FOR INSERT WITH CHECK (true);
CREATE POLICY "notificacoes_sistema_update" ON public.notificacoes_sistema FOR UPDATE USING (true);
CREATE POLICY "notificacoes_sistema_delete" ON public.notificacoes_sistema FOR DELETE USING (true);

-- ============================================================
-- 3. OPORTUNIDADES
-- ============================================================
ALTER TABLE IF EXISTS public.oportunidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "oportunidades_select" ON public.oportunidades;
DROP POLICY IF EXISTS "oportunidades_insert" ON public.oportunidades;
DROP POLICY IF EXISTS "oportunidades_update" ON public.oportunidades;
DROP POLICY IF EXISTS "oportunidades_delete" ON public.oportunidades;
DROP POLICY IF EXISTS "allow_all_oportunidades" ON public.oportunidades;

CREATE POLICY "oportunidades_select" ON public.oportunidades FOR SELECT USING (true);
CREATE POLICY "oportunidades_insert" ON public.oportunidades FOR INSERT WITH CHECK (true);
CREATE POLICY "oportunidades_update" ON public.oportunidades FOR UPDATE USING (true);
CREATE POLICY "oportunidades_delete" ON public.oportunidades FOR DELETE USING (true);

-- ============================================================
-- 4. OPORTUNIDADE TIMELINE
-- ============================================================
ALTER TABLE IF EXISTS public.oportunidade_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "oportunidade_timeline_select" ON public.oportunidade_timeline;
DROP POLICY IF EXISTS "oportunidade_timeline_insert" ON public.oportunidade_timeline;
DROP POLICY IF EXISTS "oportunidade_timeline_update" ON public.oportunidade_timeline;
DROP POLICY IF EXISTS "oportunidade_timeline_delete" ON public.oportunidade_timeline;

CREATE POLICY "oportunidade_timeline_select" ON public.oportunidade_timeline FOR SELECT USING (true);
CREATE POLICY "oportunidade_timeline_insert" ON public.oportunidade_timeline FOR INSERT WITH CHECK (true);
CREATE POLICY "oportunidade_timeline_update" ON public.oportunidade_timeline FOR UPDATE USING (true);
CREATE POLICY "oportunidade_timeline_delete" ON public.oportunidade_timeline FOR DELETE USING (true);

-- ============================================================
-- 5. NUCLEOS_COLUNAS (Kanban columns)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nucleos_colunas') THEN
        CREATE TABLE public.nucleos_colunas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nucleo TEXT NOT NULL CHECK (nucleo IN ('Arquitetura', 'Engenharia', 'Marcenaria', 'Designer')),
            titulo TEXT NOT NULL,
            ordem INTEGER DEFAULT 0,
            cor TEXT DEFAULT '#6B7280',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Índices
        CREATE INDEX idx_nucleos_colunas_nucleo ON public.nucleos_colunas(nucleo);

        -- Inserir colunas padrão para cada núcleo
        INSERT INTO public.nucleos_colunas (nucleo, titulo, ordem, cor) VALUES
        -- Arquitetura
        ('Arquitetura', 'Prospecção', 1, '#6366F1'),
        ('Arquitetura', 'Em Análise', 2, '#F59E0B'),
        ('Arquitetura', 'Proposta Enviada', 3, '#3B82F6'),
        ('Arquitetura', 'Negociação', 4, '#8B5CF6'),
        ('Arquitetura', 'Fechado', 5, '#10B981'),
        -- Engenharia
        ('Engenharia', 'Prospecção', 1, '#6366F1'),
        ('Engenharia', 'Em Análise', 2, '#F59E0B'),
        ('Engenharia', 'Proposta Enviada', 3, '#3B82F6'),
        ('Engenharia', 'Negociação', 4, '#8B5CF6'),
        ('Engenharia', 'Fechado', 5, '#10B981'),
        -- Marcenaria
        ('Marcenaria', 'Prospecção', 1, '#6366F1'),
        ('Marcenaria', 'Em Análise', 2, '#F59E0B'),
        ('Marcenaria', 'Proposta Enviada', 3, '#3B82F6'),
        ('Marcenaria', 'Negociação', 4, '#8B5CF6'),
        ('Marcenaria', 'Fechado', 5, '#10B981');

        RAISE NOTICE 'Tabela nucleos_colunas criada com colunas padrão';
    ELSE
        RAISE NOTICE 'Tabela nucleos_colunas já existe';
    END IF;
END $$;

ALTER TABLE IF EXISTS public.nucleos_colunas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nucleos_colunas_select" ON public.nucleos_colunas;
DROP POLICY IF EXISTS "nucleos_colunas_insert" ON public.nucleos_colunas;
DROP POLICY IF EXISTS "nucleos_colunas_update" ON public.nucleos_colunas;
DROP POLICY IF EXISTS "nucleos_colunas_delete" ON public.nucleos_colunas;

CREATE POLICY "nucleos_colunas_select" ON public.nucleos_colunas FOR SELECT USING (true);
CREATE POLICY "nucleos_colunas_insert" ON public.nucleos_colunas FOR INSERT WITH CHECK (true);
CREATE POLICY "nucleos_colunas_update" ON public.nucleos_colunas FOR UPDATE USING (true);
CREATE POLICY "nucleos_colunas_delete" ON public.nucleos_colunas FOR DELETE USING (true);

-- ============================================================
-- 6. NUCLEOS_OPORTUNIDADES_POSICOES (Kanban card positions)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nucleos_oportunidades_posicoes') THEN
        CREATE TABLE public.nucleos_oportunidades_posicoes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
            nucleo TEXT NOT NULL CHECK (nucleo IN ('Arquitetura', 'Engenharia', 'Marcenaria', 'Designer')),
            coluna_id UUID NOT NULL,
            ordem INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(oportunidade_id, nucleo)
        );

        -- Índices
        CREATE INDEX idx_nucleos_oportunidades_posicoes_nucleo ON public.nucleos_oportunidades_posicoes(nucleo);
        CREATE INDEX idx_nucleos_oportunidades_posicoes_coluna ON public.nucleos_oportunidades_posicoes(coluna_id);
        CREATE INDEX idx_nucleos_oportunidades_posicoes_oportunidade ON public.nucleos_oportunidades_posicoes(oportunidade_id);

        RAISE NOTICE 'Tabela nucleos_oportunidades_posicoes criada';
    ELSE
        RAISE NOTICE 'Tabela nucleos_oportunidades_posicoes já existe';
    END IF;
END $$;

ALTER TABLE IF EXISTS public.nucleos_oportunidades_posicoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_select" ON public.nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_insert" ON public.nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_update" ON public.nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_delete" ON public.nucleos_oportunidades_posicoes;

CREATE POLICY "nucleos_oportunidades_posicoes_select" ON public.nucleos_oportunidades_posicoes FOR SELECT USING (true);
CREATE POLICY "nucleos_oportunidades_posicoes_insert" ON public.nucleos_oportunidades_posicoes FOR INSERT WITH CHECK (true);
CREATE POLICY "nucleos_oportunidades_posicoes_update" ON public.nucleos_oportunidades_posicoes FOR UPDATE USING (true);
CREATE POLICY "nucleos_oportunidades_posicoes_delete" ON public.nucleos_oportunidades_posicoes FOR DELETE USING (true);

-- ============================================================
-- 7. NUCLEOS (verificar se existe)
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nucleos') THEN
        ALTER TABLE public.nucleos ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "nucleos_select" ON public.nucleos;
        DROP POLICY IF EXISTS "nucleos_insert" ON public.nucleos;
        DROP POLICY IF EXISTS "nucleos_update" ON public.nucleos;
        DROP POLICY IF EXISTS "nucleos_delete" ON public.nucleos;

        CREATE POLICY "nucleos_select" ON public.nucleos FOR SELECT USING (true);
        CREATE POLICY "nucleos_insert" ON public.nucleos FOR INSERT WITH CHECK (true);
        CREATE POLICY "nucleos_update" ON public.nucleos FOR UPDATE USING (true);
        CREATE POLICY "nucleos_delete" ON public.nucleos FOR DELETE USING (true);

        RAISE NOTICE 'Políticas RLS aplicadas na tabela nucleos';
    ELSE
        RAISE NOTICE 'Tabela nucleos não existe';
    END IF;
END $$;

-- ============================================================
-- 6. PESSOAS (garantir acesso)
-- ============================================================
ALTER TABLE IF EXISTS public.pessoas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pessoas_select" ON public.pessoas;
DROP POLICY IF EXISTS "pessoas_insert" ON public.pessoas;
DROP POLICY IF EXISTS "pessoas_update" ON public.pessoas;
DROP POLICY IF EXISTS "pessoas_delete" ON public.pessoas;
DROP POLICY IF EXISTS "allow_all_pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Permitir leitura de pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Permitir inserção de pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Permitir atualização de pessoas" ON public.pessoas;

CREATE POLICY "pessoas_select" ON public.pessoas FOR SELECT USING (true);
CREATE POLICY "pessoas_insert" ON public.pessoas FOR INSERT WITH CHECK (true);
CREATE POLICY "pessoas_update" ON public.pessoas FOR UPDATE USING (true);
CREATE POLICY "pessoas_delete" ON public.pessoas FOR DELETE USING (true);

-- ============================================================
-- 7. COMENTARIOS_NOTIFICACOES
-- ============================================================
ALTER TABLE IF EXISTS public.comentarios_notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comentarios_notificacoes_select" ON public.comentarios_notificacoes;
DROP POLICY IF EXISTS "comentarios_notificacoes_insert" ON public.comentarios_notificacoes;
DROP POLICY IF EXISTS "comentarios_notificacoes_update" ON public.comentarios_notificacoes;
DROP POLICY IF EXISTS "comentarios_notificacoes_delete" ON public.comentarios_notificacoes;

CREATE POLICY "comentarios_notificacoes_select" ON public.comentarios_notificacoes FOR SELECT USING (true);
CREATE POLICY "comentarios_notificacoes_insert" ON public.comentarios_notificacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "comentarios_notificacoes_update" ON public.comentarios_notificacoes FOR UPDATE USING (true);
CREATE POLICY "comentarios_notificacoes_delete" ON public.comentarios_notificacoes FOR DELETE USING (true);

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 'Políticas RLS das tabelas:' as info;

SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN (
    'notificacoes',
    'notificacoes_sistema',
    'oportunidades',
    'oportunidade_timeline',
    'nucleos',
    'nucleos_colunas',
    'nucleos_oportunidades_posicoes',
    'pessoas',
    'comentarios_notificacoes'
)
ORDER BY tablename, policyname;

-- Listar tabelas criadas/verificadas
SELECT 'Tabelas do Kanban:' as info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('nucleos_colunas', 'nucleos_oportunidades_posicoes');
