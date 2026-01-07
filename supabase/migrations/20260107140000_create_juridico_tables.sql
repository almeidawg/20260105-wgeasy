-- =============================================
-- MIGRATION: Criar tabelas do módulo Jurídico
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- NOTA: FKs opcionais para evitar erros de dependência
-- =============================================

-- =============================================
-- 1. TABELA: assistencia_juridica
-- =============================================

CREATE TABLE IF NOT EXISTS assistencia_juridica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_solicitante VARCHAR(20) NOT NULL CHECK (tipo_solicitante IN ('CLIENTE', 'COLABORADOR', 'FORNECEDOR')),
    solicitante_id UUID,
    tipo_processo VARCHAR(30) NOT NULL CHECK (tipo_processo IN ('TRABALHISTA', 'CLIENTE_CONTRA_EMPRESA', 'EMPRESA_CONTRA_CLIENTE', 'INTERMEDIACAO', 'OUTRO')),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'EM_ANDAMENTO', 'RESOLVIDO', 'ARQUIVADO')),
    prioridade VARCHAR(10) NOT NULL DEFAULT 'MEDIA' CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')),
    numero_processo VARCHAR(50),
    vara VARCHAR(100),
    comarca VARCHAR(100),
    advogado_responsavel VARCHAR(255),
    valor_causa DECIMAL(15,2) DEFAULT 0,
    valor_acordo DECIMAL(15,2),
    data_abertura DATE DEFAULT CURRENT_DATE,
    data_audiencia DATE,
    data_encerramento DATE,
    observacoes TEXT,
    criado_por UUID,
    atualizado_por UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistencia_juridica_solicitante ON assistencia_juridica(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_assistencia_juridica_tipo ON assistencia_juridica(tipo_processo);
CREATE INDEX IF NOT EXISTS idx_assistencia_juridica_status ON assistencia_juridica(status);
CREATE INDEX IF NOT EXISTS idx_assistencia_juridica_prioridade ON assistencia_juridica(prioridade);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_assistencia_juridica_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assistencia_juridica_updated_at ON assistencia_juridica;
CREATE TRIGGER trigger_assistencia_juridica_updated_at
    BEFORE UPDATE ON assistencia_juridica
    FOR EACH ROW EXECUTE FUNCTION update_assistencia_juridica_updated_at();

-- =============================================
-- 2. TABELA: assistencia_juridica_historico
-- =============================================

CREATE TABLE IF NOT EXISTS assistencia_juridica_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistencia_id UUID NOT NULL REFERENCES assistencia_juridica(id) ON DELETE CASCADE,
    tipo_movimentacao VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    usuario_id UUID,
    usuario_nome VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistencia_historico_assistencia ON assistencia_juridica_historico(assistencia_id);

-- =============================================
-- 3. TABELA: financeiro_juridico
-- =============================================

CREATE TABLE IF NOT EXISTS financeiro_juridico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistencia_id UUID REFERENCES assistencia_juridica(id),
    contrato_id UUID,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('HONORARIO', 'CUSTAS', 'TAXA', 'ACORDO', 'MULTA', 'OUTROS', 'MENSALIDADE')),
    natureza VARCHAR(10) NOT NULL CHECK (natureza IN ('RECEITA', 'DESPESA')),
    descricao VARCHAR(500) NOT NULL,
    observacoes TEXT,
    valor DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    data_competencia DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'PARCIAL', 'CANCELADO', 'ATRASADO')),
    parcela_atual INT DEFAULT 1,
    total_parcelas INT DEFAULT 1,
    pessoa_id UUID,
    empresa_id UUID,
    sincronizado_financeiro BOOLEAN DEFAULT FALSE,
    financeiro_lancamento_id UUID,
    criado_por UUID,
    atualizado_por UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_assistencia ON financeiro_juridico(assistencia_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_tipo ON financeiro_juridico(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_status ON financeiro_juridico(status);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_vencimento ON financeiro_juridico(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_competencia ON financeiro_juridico(data_competencia);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_financeiro_juridico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'PENDENTE' THEN
        NEW.status = 'ATRASADO';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_financeiro_juridico_updated_at ON financeiro_juridico;
CREATE TRIGGER trigger_financeiro_juridico_updated_at
    BEFORE UPDATE ON financeiro_juridico
    FOR EACH ROW EXECUTE FUNCTION update_financeiro_juridico_updated_at();

-- =============================================
-- 4. RLS (Row Level Security)
-- =============================================

ALTER TABLE assistencia_juridica ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistencia_juridica_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_juridico ENABLE ROW LEVEL SECURITY;

-- Políticas para assistencia_juridica
DROP POLICY IF EXISTS "assistencia_juridica_select" ON assistencia_juridica;
CREATE POLICY "assistencia_juridica_select" ON assistencia_juridica
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO', 'FINANCEIRO')
            AND u.ativo = true
        )
    );

DROP POLICY IF EXISTS "assistencia_juridica_insert" ON assistencia_juridica;
CREATE POLICY "assistencia_juridica_insert" ON assistencia_juridica
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO')
            AND u.ativo = true
        )
    );

DROP POLICY IF EXISTS "assistencia_juridica_update" ON assistencia_juridica;
CREATE POLICY "assistencia_juridica_update" ON assistencia_juridica
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO')
            AND u.ativo = true
        )
    );

DROP POLICY IF EXISTS "assistencia_juridica_delete" ON assistencia_juridica;
CREATE POLICY "assistencia_juridica_delete" ON assistencia_juridica
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN')
            AND u.ativo = true
        )
    );

-- Políticas para financeiro_juridico
DROP POLICY IF EXISTS "financeiro_juridico_select" ON financeiro_juridico;
CREATE POLICY "financeiro_juridico_select" ON financeiro_juridico
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO', 'FINANCEIRO')
            AND u.ativo = true
        )
    );

DROP POLICY IF EXISTS "financeiro_juridico_insert" ON financeiro_juridico;
CREATE POLICY "financeiro_juridico_insert" ON financeiro_juridico
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO', 'FINANCEIRO')
            AND u.ativo = true
        )
    );

DROP POLICY IF EXISTS "financeiro_juridico_update" ON financeiro_juridico;
CREATE POLICY "financeiro_juridico_update" ON financeiro_juridico
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO', 'FINANCEIRO')
            AND u.ativo = true
        )
    );

DROP POLICY IF EXISTS "financeiro_juridico_delete" ON financeiro_juridico;
CREATE POLICY "financeiro_juridico_delete" ON financeiro_juridico
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN')
            AND u.ativo = true
        )
    );

-- Políticas para histórico
DROP POLICY IF EXISTS "assistencia_juridica_historico_select" ON assistencia_juridica_historico;
CREATE POLICY "assistencia_juridica_historico_select" ON assistencia_juridica_historico
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO', 'FINANCEIRO')
            AND u.ativo = true
        )
    );

DROP POLICY IF EXISTS "assistencia_juridica_historico_insert" ON assistencia_juridica_historico;
CREATE POLICY "assistencia_juridica_historico_insert" ON assistencia_juridica_historico
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'JURIDICO')
            AND u.ativo = true
        )
    );

-- =============================================
-- FIM DA MIGRATION
-- =============================================
