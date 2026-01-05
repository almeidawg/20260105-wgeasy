-- Execute DEPOIS do script 01
-- Cria tabelas do Kanban por Núcleo

-- 1. NUCLEOS_COLUNAS
CREATE TABLE IF NOT EXISTS public.nucleos_colunas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nucleo TEXT NOT NULL CHECK (nucleo IN ('Arquitetura', 'Engenharia', 'Marcenaria', 'Designer')),
    titulo TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    cor TEXT DEFAULT '#6B7280',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nucleos_colunas_nucleo ON public.nucleos_colunas(nucleo);

-- Inserir colunas padrão (só se tabela estiver vazia)
INSERT INTO public.nucleos_colunas (nucleo, titulo, ordem, cor)
SELECT * FROM (VALUES
    ('Arquitetura', 'Prospecção', 1, '#6366F1'),
    ('Arquitetura', 'Em Análise', 2, '#F59E0B'),
    ('Arquitetura', 'Proposta Enviada', 3, '#3B82F6'),
    ('Arquitetura', 'Negociação', 4, '#8B5CF6'),
    ('Arquitetura', 'Fechado', 5, '#10B981'),
    ('Engenharia', 'Prospecção', 1, '#6366F1'),
    ('Engenharia', 'Em Análise', 2, '#F59E0B'),
    ('Engenharia', 'Proposta Enviada', 3, '#3B82F6'),
    ('Engenharia', 'Negociação', 4, '#8B5CF6'),
    ('Engenharia', 'Fechado', 5, '#10B981'),
    ('Marcenaria', 'Prospecção', 1, '#6366F1'),
    ('Marcenaria', 'Em Análise', 2, '#F59E0B'),
    ('Marcenaria', 'Proposta Enviada', 3, '#3B82F6'),
    ('Marcenaria', 'Negociação', 4, '#8B5CF6'),
    ('Marcenaria', 'Fechado', 5, '#10B981')
) AS v(nucleo, titulo, ordem, cor)
WHERE NOT EXISTS (SELECT 1 FROM public.nucleos_colunas LIMIT 1);

ALTER TABLE public.nucleos_colunas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nucleos_colunas_select" ON public.nucleos_colunas;
DROP POLICY IF EXISTS "nucleos_colunas_insert" ON public.nucleos_colunas;
DROP POLICY IF EXISTS "nucleos_colunas_update" ON public.nucleos_colunas;
DROP POLICY IF EXISTS "nucleos_colunas_delete" ON public.nucleos_colunas;

CREATE POLICY "nucleos_colunas_select" ON public.nucleos_colunas FOR SELECT USING (true);
CREATE POLICY "nucleos_colunas_insert" ON public.nucleos_colunas FOR INSERT WITH CHECK (true);
CREATE POLICY "nucleos_colunas_update" ON public.nucleos_colunas FOR UPDATE USING (true);
CREATE POLICY "nucleos_colunas_delete" ON public.nucleos_colunas FOR DELETE USING (true);

-- 2. NUCLEOS_OPORTUNIDADES_POSICOES
CREATE TABLE IF NOT EXISTS public.nucleos_oportunidades_posicoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
    nucleo TEXT NOT NULL CHECK (nucleo IN ('Arquitetura', 'Engenharia', 'Marcenaria', 'Designer')),
    coluna_id UUID NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(oportunidade_id, nucleo)
);

CREATE INDEX IF NOT EXISTS idx_nucleos_oportunidades_posicoes_nucleo ON public.nucleos_oportunidades_posicoes(nucleo);
CREATE INDEX IF NOT EXISTS idx_nucleos_oportunidades_posicoes_coluna ON public.nucleos_oportunidades_posicoes(coluna_id);
CREATE INDEX IF NOT EXISTS idx_nucleos_oportunidades_posicoes_oportunidade ON public.nucleos_oportunidades_posicoes(oportunidade_id);

ALTER TABLE public.nucleos_oportunidades_posicoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_select" ON public.nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_insert" ON public.nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_update" ON public.nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS "nucleos_oportunidades_posicoes_delete" ON public.nucleos_oportunidades_posicoes;

CREATE POLICY "nucleos_oportunidades_posicoes_select" ON public.nucleos_oportunidades_posicoes FOR SELECT USING (true);
CREATE POLICY "nucleos_oportunidades_posicoes_insert" ON public.nucleos_oportunidades_posicoes FOR INSERT WITH CHECK (true);
CREATE POLICY "nucleos_oportunidades_posicoes_update" ON public.nucleos_oportunidades_posicoes FOR UPDATE USING (true);
CREATE POLICY "nucleos_oportunidades_posicoes_delete" ON public.nucleos_oportunidades_posicoes FOR DELETE USING (true);

-- Verificação
SELECT 'Tabelas do Kanban criadas!' as status;
SELECT COUNT(*) as colunas_criadas FROM public.nucleos_colunas;
