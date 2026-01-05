-- ============================================================
-- CRIAR TABELA: Solicitações de Reembolso e Pagamentos
-- Sistema WG Easy - Grupo WG Almeida
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. TABELA PRINCIPAL DE SOLICITAÇÕES
CREATE TABLE IF NOT EXISTS public.solicitacoes_reembolso (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Tipo da solicitação
    tipo TEXT NOT NULL CHECK (tipo IN ('reembolso', 'pagamento')),

    -- Quem solicitou
    solicitante_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,

    -- Cliente vinculado (para cobrança/faturamento)
    cliente_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,

    -- Contrato/Projeto vinculado (opcional)
    contrato_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,

    -- Dados da despesa
    descricao TEXT NOT NULL,
    valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
    data_despesa DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria TEXT DEFAULT 'outros',

    -- Dados do comprovante
    comprovante_url TEXT,
    comprovante_nome TEXT,
    comprovante_dados JSONB, -- Dados extraídos por OCR

    -- Link Google Drive (pasta do cliente)
    google_drive_url TEXT,
    google_drive_file_id TEXT,

    -- Status do fluxo
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN (
        'pendente',      -- Aguardando aprovação
        'aprovado',      -- Aprovado, aguardando pagamento
        'rejeitado',     -- Rejeitado
        'pago',          -- Pago ao solicitante
        'faturado',      -- Cobrado do cliente
        'cancelado'      -- Cancelado
    )),

    -- Comentários e observações
    comentario_solicitante TEXT,
    comentario_aprovador TEXT,

    -- Dados do aprovador
    aprovado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    aprovado_em TIMESTAMPTZ,

    -- Dados do pagamento
    pago_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    pago_em TIMESTAMPTZ,
    comprovante_pagamento_url TEXT,

    -- Vínculo com lançamento financeiro (quando faturado)
    -- Será UUID sem FK para evitar dependência de tabela que pode não existir
    lancamento_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitacoes_reembolso_solicitante ON public.solicitacoes_reembolso(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_reembolso_cliente ON public.solicitacoes_reembolso(cliente_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_reembolso_contrato ON public.solicitacoes_reembolso(contrato_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_reembolso_status ON public.solicitacoes_reembolso(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_reembolso_tipo ON public.solicitacoes_reembolso(tipo);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_reembolso_data ON public.solicitacoes_reembolso(data_despesa);

-- RLS
ALTER TABLE public.solicitacoes_reembolso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "solicitacoes_reembolso_select" ON public.solicitacoes_reembolso;
DROP POLICY IF EXISTS "solicitacoes_reembolso_insert" ON public.solicitacoes_reembolso;
DROP POLICY IF EXISTS "solicitacoes_reembolso_update" ON public.solicitacoes_reembolso;
DROP POLICY IF EXISTS "solicitacoes_reembolso_delete" ON public.solicitacoes_reembolso;

CREATE POLICY "solicitacoes_reembolso_select" ON public.solicitacoes_reembolso FOR SELECT USING (true);
CREATE POLICY "solicitacoes_reembolso_insert" ON public.solicitacoes_reembolso FOR INSERT WITH CHECK (true);
CREATE POLICY "solicitacoes_reembolso_update" ON public.solicitacoes_reembolso FOR UPDATE USING (true);
CREATE POLICY "solicitacoes_reembolso_delete" ON public.solicitacoes_reembolso FOR DELETE USING (true);

-- 2. TABELA DE CATEGORIAS DE DESPESAS
CREATE TABLE IF NOT EXISTS public.categorias_despesa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    icone TEXT DEFAULT 'receipt',
    cor TEXT DEFAULT '#6B7280',
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO public.categorias_despesa (nome, descricao, icone, cor, ordem)
SELECT * FROM (VALUES
    ('Alimentação', 'Refeições, lanches, café', 'utensils', '#F59E0B', 1),
    ('Transporte', 'Uber, táxi, combustível, estacionamento', 'car', '#3B82F6', 2),
    ('Material de Obra', 'Materiais comprados para obra', 'hammer', '#10B981', 3),
    ('Hospedagem', 'Hotel, pousada', 'bed', '#8B5CF6', 4),
    ('Ferramentas', 'Compra ou aluguel de ferramentas', 'wrench', '#EC4899', 5),
    ('Equipamentos', 'Equipamentos de proteção, EPI', 'hard-hat', '#EF4444', 6),
    ('Serviços', 'Pagamento de serviços terceirizados', 'briefcase', '#06B6D4', 7),
    ('Documentação', 'Taxas, cartórios, impressões', 'file-text', '#6366F1', 8),
    ('Comunicação', 'Telefone, internet', 'phone', '#84CC16', 9),
    ('Outros', 'Outras despesas', 'receipt', '#6B7280', 99)
) AS v(nome, descricao, icone, cor, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa LIMIT 1);

-- RLS para categorias
ALTER TABLE public.categorias_despesa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categorias_despesa_select" ON public.categorias_despesa;
CREATE POLICY "categorias_despesa_select" ON public.categorias_despesa FOR SELECT USING (true);

-- 3. TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_solicitacoes_reembolso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_solicitacoes_reembolso_updated_at ON public.solicitacoes_reembolso;
CREATE TRIGGER trigger_solicitacoes_reembolso_updated_at
    BEFORE UPDATE ON public.solicitacoes_reembolso
    FOR EACH ROW
    EXECUTE FUNCTION update_solicitacoes_reembolso_updated_at();

-- 4. VIEW PARA LISTAGEM COM DADOS RELACIONADOS
CREATE OR REPLACE VIEW public.v_solicitacoes_reembolso AS
SELECT
    sr.*,
    ps.nome AS solicitante_nome,
    ps.avatar_url AS solicitante_avatar,
    pc.nome AS cliente_nome,
    c.numero AS contrato_numero,
    pua.nome AS aprovador_nome,
    pup.nome AS pagador_nome
FROM public.solicitacoes_reembolso sr
LEFT JOIN public.pessoas ps ON sr.solicitante_id = ps.id
LEFT JOIN public.pessoas pc ON sr.cliente_id = pc.id
LEFT JOIN public.contratos c ON sr.contrato_id = c.id
LEFT JOIN public.usuarios ua ON sr.aprovado_por = ua.id
LEFT JOIN public.pessoas pua ON ua.pessoa_id = pua.id
LEFT JOIN public.usuarios up ON sr.pago_por = up.id
LEFT JOIN public.pessoas pup ON up.pessoa_id = pup.id
ORDER BY sr.created_at DESC;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 'Tabelas de Reembolso criadas!' as status;

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('solicitacoes_reembolso', 'categorias_despesa');

SELECT COUNT(*) as categorias_criadas FROM public.categorias_despesa;
