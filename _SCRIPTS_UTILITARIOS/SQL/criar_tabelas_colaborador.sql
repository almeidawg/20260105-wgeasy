-- ============================================================
-- CRIAR TABELAS E COLUNAS PARA ÁREA DO COLABORADOR
-- Sistema WG Easy - Grupo WG Almeida
-- Execute no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABELA: agenda_colaborador
-- Agenda de compromissos dos colaboradores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agenda_colaborador (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    colaborador_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    local TEXT,
    tipo TEXT DEFAULT 'compromisso' CHECK (tipo IN ('compromisso', 'reuniao', 'visita', 'obra', 'entrega', 'outro')),
    status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluido')),
    projeto_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agenda_colaborador_colaborador ON public.agenda_colaborador(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_agenda_colaborador_data ON public.agenda_colaborador(data);
CREATE INDEX IF NOT EXISTS idx_agenda_colaborador_status ON public.agenda_colaborador(status);

-- RLS
ALTER TABLE public.agenda_colaborador ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agenda_colaborador_select" ON public.agenda_colaborador;
DROP POLICY IF EXISTS "agenda_colaborador_insert" ON public.agenda_colaborador;
DROP POLICY IF EXISTS "agenda_colaborador_update" ON public.agenda_colaborador;
DROP POLICY IF EXISTS "agenda_colaborador_delete" ON public.agenda_colaborador;

CREATE POLICY "agenda_colaborador_select" ON public.agenda_colaborador FOR SELECT USING (true);
CREATE POLICY "agenda_colaborador_insert" ON public.agenda_colaborador FOR INSERT WITH CHECK (true);
CREATE POLICY "agenda_colaborador_update" ON public.agenda_colaborador FOR UPDATE USING (true);
CREATE POLICY "agenda_colaborador_delete" ON public.agenda_colaborador FOR DELETE USING (true);

-- ============================================================
-- 2. TABELA: checklist_colaborador
-- Checklist diário dos colaboradores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.checklist_colaborador (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    colaborador_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    texto TEXT NOT NULL,
    concluido BOOLEAN DEFAULT FALSE,
    concluido_em TIMESTAMPTZ,
    ordem INTEGER DEFAULT 0,
    prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
    projeto_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(colaborador_id, data, texto)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_checklist_colaborador_colaborador ON public.checklist_colaborador(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_checklist_colaborador_data ON public.checklist_colaborador(data);
CREATE INDEX IF NOT EXISTS idx_checklist_colaborador_concluido ON public.checklist_colaborador(concluido);

-- RLS
ALTER TABLE public.checklist_colaborador ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checklist_colaborador_select" ON public.checklist_colaborador;
DROP POLICY IF EXISTS "checklist_colaborador_insert" ON public.checklist_colaborador;
DROP POLICY IF EXISTS "checklist_colaborador_update" ON public.checklist_colaborador;
DROP POLICY IF EXISTS "checklist_colaborador_delete" ON public.checklist_colaborador;

CREATE POLICY "checklist_colaborador_select" ON public.checklist_colaborador FOR SELECT USING (true);
CREATE POLICY "checklist_colaborador_insert" ON public.checklist_colaborador FOR INSERT WITH CHECK (true);
CREATE POLICY "checklist_colaborador_update" ON public.checklist_colaborador FOR UPDATE USING (true);
CREATE POLICY "checklist_colaborador_delete" ON public.checklist_colaborador FOR DELETE USING (true);

-- ============================================================
-- 3. ADICIONAR COLUNA: solicitacoes_servico.colaborador_id
-- Vincular colaborador responsável à solicitação
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'solicitacoes_servico' AND column_name = 'colaborador_id'
    ) THEN
        ALTER TABLE public.solicitacoes_servico
        ADD COLUMN colaborador_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_solicitacoes_servico_colaborador
        ON public.solicitacoes_servico(colaborador_id);

        RAISE NOTICE 'Coluna colaborador_id adicionada em solicitacoes_servico';
    ELSE
        RAISE NOTICE 'Coluna colaborador_id já existe em solicitacoes_servico';
    END IF;
END $$;

-- ============================================================
-- 4. ADICIONAR COLUNAS: contratos.arquiteto_id, engenheiro_id e marceneiro_id
-- Vincular responsáveis ao contrato
-- ============================================================
DO $$
BEGIN
    -- Adicionar arquiteto_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contratos' AND column_name = 'arquiteto_id'
    ) THEN
        ALTER TABLE public.contratos
        ADD COLUMN arquiteto_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_contratos_arquiteto ON public.contratos(arquiteto_id);

        RAISE NOTICE 'Coluna arquiteto_id adicionada em contratos';
    ELSE
        RAISE NOTICE 'Coluna arquiteto_id já existe em contratos';
    END IF;

    -- Adicionar engenheiro_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contratos' AND column_name = 'engenheiro_id'
    ) THEN
        ALTER TABLE public.contratos
        ADD COLUMN engenheiro_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_contratos_engenheiro ON public.contratos(engenheiro_id);

        RAISE NOTICE 'Coluna engenheiro_id adicionada em contratos';
    ELSE
        RAISE NOTICE 'Coluna engenheiro_id já existe em contratos';
    END IF;

    -- Adicionar marceneiro_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contratos' AND column_name = 'marceneiro_id'
    ) THEN
        ALTER TABLE public.contratos
        ADD COLUMN marceneiro_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_contratos_marceneiro ON public.contratos(marceneiro_id);

        RAISE NOTICE 'Coluna marceneiro_id adicionada em contratos';
    ELSE
        RAISE NOTICE 'Coluna marceneiro_id já existe em contratos';
    END IF;
END $$;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 'Tabelas criadas:' as info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('agenda_colaborador', 'checklist_colaborador');

SELECT 'Colunas adicionadas em solicitacoes_servico:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'solicitacoes_servico'
AND column_name = 'colaborador_id';

SELECT 'Colunas adicionadas em contratos:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contratos'
AND column_name IN ('arquiteto_id', 'engenheiro_id', 'marceneiro_id');
