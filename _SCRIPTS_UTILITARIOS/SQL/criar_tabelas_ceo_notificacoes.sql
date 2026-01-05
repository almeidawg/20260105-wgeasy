-- ============================================================
-- CRIAR TABELAS: CEO Checklist e Notificacoes Sistema
-- Sistema WG Easy - Grupo WG Almeida
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. TABELA: ceo_checklist_diario
-- Checklist diário do CEO/Founder
CREATE TABLE IF NOT EXISTS public.ceo_checklist_diario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, data)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_diario_usuario ON public.ceo_checklist_diario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_diario_data ON public.ceo_checklist_diario(data);

-- RLS
ALTER TABLE public.ceo_checklist_diario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_checklist_diario_select" ON public.ceo_checklist_diario;
DROP POLICY IF EXISTS "ceo_checklist_diario_insert" ON public.ceo_checklist_diario;
DROP POLICY IF EXISTS "ceo_checklist_diario_update" ON public.ceo_checklist_diario;

CREATE POLICY "ceo_checklist_diario_select" ON public.ceo_checklist_diario
    FOR SELECT USING (true);

CREATE POLICY "ceo_checklist_diario_insert" ON public.ceo_checklist_diario
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ceo_checklist_diario_update" ON public.ceo_checklist_diario
    FOR UPDATE USING (true);

-- 2. TABELA: ceo_checklist_itens
-- Itens do checklist diário
CREATE TABLE IF NOT EXISTS public.ceo_checklist_itens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    checklist_id UUID NOT NULL REFERENCES public.ceo_checklist_diario(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
    concluido BOOLEAN DEFAULT FALSE,
    concluido_em TIMESTAMPTZ,
    ordem INTEGER DEFAULT 0,
    fonte TEXT DEFAULT 'manual' CHECK (fonte IN ('manual', 'mencao', 'automatico', 'recorrente')),
    referencia_id UUID,
    criado_por UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_itens_checklist ON public.ceo_checklist_itens(checklist_id);
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_itens_concluido ON public.ceo_checklist_itens(concluido);

-- RLS
ALTER TABLE public.ceo_checklist_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_checklist_itens_select" ON public.ceo_checklist_itens;
DROP POLICY IF EXISTS "ceo_checklist_itens_insert" ON public.ceo_checklist_itens;
DROP POLICY IF EXISTS "ceo_checklist_itens_update" ON public.ceo_checklist_itens;
DROP POLICY IF EXISTS "ceo_checklist_itens_delete" ON public.ceo_checklist_itens;

CREATE POLICY "ceo_checklist_itens_select" ON public.ceo_checklist_itens
    FOR SELECT USING (true);

CREATE POLICY "ceo_checklist_itens_insert" ON public.ceo_checklist_itens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ceo_checklist_itens_update" ON public.ceo_checklist_itens
    FOR UPDATE USING (true);

CREATE POLICY "ceo_checklist_itens_delete" ON public.ceo_checklist_itens
    FOR DELETE USING (true);

-- 3. TABELA: ceo_checklist_mencoes
-- Menções (@usuario) em itens do checklist
CREATE TABLE IF NOT EXISTS public.ceo_checklist_mencoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES public.ceo_checklist_itens(id) ON DELETE CASCADE,
    usuario_mencionado_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    usuario_autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    lido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, usuario_mencionado_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_mencoes_mencionado ON public.ceo_checklist_mencoes(usuario_mencionado_id);
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_mencoes_lido ON public.ceo_checklist_mencoes(lido);

-- RLS
ALTER TABLE public.ceo_checklist_mencoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_checklist_mencoes_select" ON public.ceo_checklist_mencoes;
DROP POLICY IF EXISTS "ceo_checklist_mencoes_insert" ON public.ceo_checklist_mencoes;
DROP POLICY IF EXISTS "ceo_checklist_mencoes_update" ON public.ceo_checklist_mencoes;

CREATE POLICY "ceo_checklist_mencoes_select" ON public.ceo_checklist_mencoes
    FOR SELECT USING (true);

CREATE POLICY "ceo_checklist_mencoes_insert" ON public.ceo_checklist_mencoes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ceo_checklist_mencoes_update" ON public.ceo_checklist_mencoes
    FOR UPDATE USING (true);

-- 4. TABELA: notificacoes_sistema
-- Notificacoes gerais do sistema
CREATE TABLE IF NOT EXISTS public.notificacoes_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'sucesso', 'aviso', 'erro', 'tarefa', 'mencao', 'comentario')),
    titulo TEXT NOT NULL,
    mensagem TEXT,
    link TEXT,
    lida BOOLEAN DEFAULT FALSE,
    dados JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificacoes_sistema_usuario ON public.notificacoes_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_sistema_lida ON public.notificacoes_sistema(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_sistema_created ON public.notificacoes_sistema(created_at DESC);

-- RLS
ALTER TABLE public.notificacoes_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificacoes_sistema_select" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_insert" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_update" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_delete" ON public.notificacoes_sistema;

CREATE POLICY "notificacoes_sistema_select" ON public.notificacoes_sistema
    FOR SELECT USING (true);

CREATE POLICY "notificacoes_sistema_insert" ON public.notificacoes_sistema
    FOR INSERT WITH CHECK (true);

CREATE POLICY "notificacoes_sistema_update" ON public.notificacoes_sistema
    FOR UPDATE USING (true);

CREATE POLICY "notificacoes_sistema_delete" ON public.notificacoes_sistema
    FOR DELETE USING (true);

-- 5. TRIGGER: Atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ceo_checklist_diario_updated_at ON public.ceo_checklist_diario;
CREATE TRIGGER update_ceo_checklist_diario_updated_at
    BEFORE UPDATE ON public.ceo_checklist_diario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VERIFICACAO
-- ============================================================
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('ceo_checklist_diario', 'ceo_checklist_itens', 'ceo_checklist_mencoes', 'notificacoes_sistema');
