-- ============================================================
-- CRIAR TABELAS DE NOTIFICAÇÕES
-- Execute este script ANTES de corrigir RLS
-- ============================================================

-- 1. NOTIFICAÇÕES
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

-- 2. NOTIFICAÇÕES SISTEMA
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
