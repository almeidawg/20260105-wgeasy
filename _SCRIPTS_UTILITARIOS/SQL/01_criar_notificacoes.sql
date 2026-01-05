-- Execute este script PRIMEIRO no Supabase SQL Editor
-- Cria tabela de notificações

CREATE TABLE IF NOT EXISTS public.notificacoes (
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

CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario ON public.notificacoes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificacoes_select" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_insert" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_update" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_delete" ON public.notificacoes;

CREATE POLICY "notificacoes_select" ON public.notificacoes FOR SELECT USING (true);
CREATE POLICY "notificacoes_insert" ON public.notificacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "notificacoes_update" ON public.notificacoes FOR UPDATE USING (true);
CREATE POLICY "notificacoes_delete" ON public.notificacoes FOR DELETE USING (true);

-- Verificação
SELECT 'Tabela notificacoes criada com sucesso!' as status;
