-- ============================================================
-- MIGRATION: Criar tabela solicitacoes_cliente
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-06
-- ============================================================
-- Esta tabela armazena solicitações/comentários dos clientes
-- que são transformados em itens de checklist para a equipe
-- ============================================================

-- Criar tabela solicitacoes_cliente
CREATE TABLE IF NOT EXISTS solicitacoes_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,

    -- Conteúdo da solicitação
    mensagem TEXT NOT NULL,
    nucleo VARCHAR(50) DEFAULT 'geral',
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'arquivado')),

    -- Resposta da equipe
    resposta TEXT,
    respondido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    respondido_em TIMESTAMPTZ,

    -- Metadados
    referencia_tipo VARCHAR(50),
    referencia_id UUID,
    dados_extras JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_pessoa_id ON solicitacoes_cliente(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_contrato_id ON solicitacoes_cliente(contrato_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_status ON solicitacoes_cliente(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_nucleo ON solicitacoes_cliente(nucleo);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_created_at ON solicitacoes_cliente(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_solicitacoes_cliente_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_solicitacoes_cliente_updated_at ON solicitacoes_cliente;
CREATE TRIGGER trigger_update_solicitacoes_cliente_updated_at
    BEFORE UPDATE ON solicitacoes_cliente
    FOR EACH ROW
    EXECUTE FUNCTION update_solicitacoes_cliente_updated_at();

-- RLS (Row Level Security)
ALTER TABLE solicitacoes_cliente ENABLE ROW LEVEL SECURITY;

-- Política para clientes verem apenas suas próprias solicitações
CREATE POLICY "Clientes podem ver suas solicitacoes"
    ON solicitacoes_cliente
    FOR SELECT
    USING (
        pessoa_id IN (
            SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('master', 'admin', 'gerente')
        )
    );

-- Política para clientes criarem solicitações
CREATE POLICY "Clientes podem criar solicitacoes"
    ON solicitacoes_cliente
    FOR INSERT
    WITH CHECK (
        pessoa_id IN (
            SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('master', 'admin', 'gerente')
        )
    );

-- Política para equipe atualizar solicitações
CREATE POLICY "Equipe pode atualizar solicitacoes"
    ON solicitacoes_cliente
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('master', 'admin', 'gerente', 'colaborador')
        )
    );

-- Comentário na tabela
COMMENT ON TABLE solicitacoes_cliente IS 'Solicitações e comentários de clientes na área do cliente';
COMMENT ON COLUMN solicitacoes_cliente.nucleo IS 'Núcleo destino: arquitetura, engenharia, marcenaria, geral';
COMMENT ON COLUMN solicitacoes_cliente.prioridade IS 'Nível de prioridade: baixa, normal, alta, urgente';
COMMENT ON COLUMN solicitacoes_cliente.status IS 'Status atual: pendente, em_andamento, concluido, arquivado';
