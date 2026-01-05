-- ============================================================
-- TABELAS: NOTIFICAÇÕES SISTEMA, KANBAN, ETC (SUPABASE COMPATÍVEL)
-- Execute este script ANTES das políticas RLS
-- ============================================================

-- 1. NOTIFICAÇÕES SISTEMA
CREATE TABLE IF NOT EXISTS public.notificacoes_sistema (
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
CREATE INDEX IF NOT EXISTS idx_notificacoes_sistema_ativa ON public.notificacoes_sistema(ativa);
CREATE INDEX IF NOT EXISTS idx_notificacoes_sistema_tipo ON public.notificacoes_sistema(tipo);

-- 2. NUCLEOS_COLUNAS (Kanban columns)
CREATE TABLE IF NOT EXISTS public.nucleos_colunas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nucleo TEXT NOT NULL CHECK (nucleo IN ('Arquitetura', 'Engenharia', 'Marcenaria', 'Designer')),
    titulo TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    cor TEXT DEFAULT '#6B7280',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nucleos_colunas_nucleo ON public.nucleos_colunas(nucleo);

-- Inserir colunas padrão para cada núcleo (executar manualmente se necessário)
-- INSERT INTO public.nucleos_colunas (nucleo, titulo, ordem, cor) VALUES
-- ('Arquitetura', 'Prospecção', 1, '#6366F1'),
-- ...

-- 3. NUCLEOS_OPORTUNIDADES_POSICOES (Kanban card positions)
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

-- Adicione outras tabelas conforme necessário
