-- =============================================
-- SCRIPT: Criar tabelas do módulo Jurídico
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-02
-- =============================================

-- =============================================
-- 1. TABELA: assistencia_juridica
-- Solicitações de assistência/intermediação jurídica
-- =============================================

CREATE TABLE IF NOT EXISTS assistencia_juridica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Solicitante
    tipo_solicitante VARCHAR(20) NOT NULL CHECK (tipo_solicitante IN ('CLIENTE', 'COLABORADOR', 'FORNECEDOR')),
    solicitante_id UUID NOT NULL REFERENCES pessoas(id),

    -- Tipo e detalhes do processo
    tipo_processo VARCHAR(30) NOT NULL CHECK (tipo_processo IN ('TRABALHISTA', 'CLIENTE_CONTRA_EMPRESA', 'EMPRESA_CONTRA_CLIENTE', 'INTERMEDIACAO', 'OUTRO')),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,

    -- Status e prioridade
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'EM_ANDAMENTO', 'RESOLVIDO', 'ARQUIVADO')),
    prioridade VARCHAR(10) NOT NULL DEFAULT 'MEDIA' CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')),

    -- Dados do processo (quando houver)
    numero_processo VARCHAR(50),
    vara VARCHAR(100),
    comarca VARCHAR(100),
    advogado_responsavel VARCHAR(255),

    -- Valores envolvidos
    valor_causa DECIMAL(15,2) DEFAULT 0,
    valor_acordo DECIMAL(15,2),

    -- Datas importantes
    data_abertura DATE DEFAULT CURRENT_DATE,
    data_audiencia DATE,
    data_encerramento DATE,

    -- Observações e histórico
    observacoes TEXT,

    -- Auditoria
    criado_por UUID REFERENCES usuarios(id),
    atualizado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
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
-- Histórico de movimentações/atualizações
-- =============================================

CREATE TABLE IF NOT EXISTS assistencia_juridica_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistencia_id UUID NOT NULL REFERENCES assistencia_juridica(id) ON DELETE CASCADE,

    tipo_movimentacao VARCHAR(50) NOT NULL, -- STATUS_ALTERADO, AUDIENCIA_MARCADA, DOCUMENTO_ANEXADO, etc
    descricao TEXT NOT NULL,

    -- Dados de quem fez a movimentação
    usuario_id UUID REFERENCES usuarios(id),
    usuario_nome VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistencia_historico_assistencia ON assistencia_juridica_historico(assistencia_id);

-- =============================================
-- 3. TABELA: financeiro_juridico
-- Lançamentos financeiros do departamento jurídico
-- =============================================

CREATE TABLE IF NOT EXISTS financeiro_juridico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referência (pode ser assistência, contrato, ou avulso)
    assistencia_id UUID REFERENCES assistencia_juridica(id),
    contrato_id UUID REFERENCES contratos(id),

    -- Tipo de lançamento
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('HONORARIO', 'CUSTAS', 'TAXA', 'ACORDO', 'MULTA', 'OUTROS', 'MENSALIDADE')),
    natureza VARCHAR(10) NOT NULL CHECK (natureza IN ('RECEITA', 'DESPESA')),

    -- Descrição
    descricao VARCHAR(500) NOT NULL,
    observacoes TEXT,

    -- Valores
    valor DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0,

    -- Datas
    data_competencia DATE NOT NULL, -- Mês de referência
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'PARCIAL', 'CANCELADO', 'ATRASADO')),

    -- Parcelamento
    parcela_atual INT DEFAULT 1,
    total_parcelas INT DEFAULT 1,

    -- Beneficiário/Pagador
    pessoa_id UUID REFERENCES pessoas(id), -- Cliente, Fornecedor ou Colaborador envolvido
    empresa_id UUID REFERENCES empresas_grupo(id), -- Empresa do grupo WG

    -- Sincronização com financeiro geral
    sincronizado_financeiro BOOLEAN DEFAULT FALSE,
    financeiro_lancamento_id UUID REFERENCES financeiro_lancamentos(id),

    -- Auditoria
    criado_por UUID REFERENCES usuarios(id),
    atualizado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_assistencia ON financeiro_juridico(assistencia_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_contrato ON financeiro_juridico(contrato_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_tipo ON financeiro_juridico(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_status ON financeiro_juridico(status);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_vencimento ON financeiro_juridico(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_competencia ON financeiro_juridico(data_competencia);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_pessoa ON financeiro_juridico(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_juridico_empresa ON financeiro_juridico(empresa_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_financeiro_juridico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- Atualiza status para ATRASADO se vencido e não pago
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
-- 4. FUNÇÃO: Sincronizar com Financeiro Geral
-- =============================================

CREATE OR REPLACE FUNCTION sincronizar_financeiro_juridico()
RETURNS TRIGGER AS $$
DECLARE
    v_lancamento_id UUID;
    v_categoria_id UUID;
    v_subcategoria_id UUID;
BEGIN
    -- Só sincroniza se ainda não foi sincronizado
    IF NEW.sincronizado_financeiro = FALSE AND NEW.status != 'CANCELADO' THEN

        -- Buscar categoria "Jurídico" ou criar se não existir
        SELECT id INTO v_categoria_id FROM financeiro_categorias WHERE nome = 'Jurídico' LIMIT 1;
        IF v_categoria_id IS NULL THEN
            INSERT INTO financeiro_categorias (nome, tipo, cor)
            VALUES ('Jurídico', NEW.natureza, '#8B5CF6')
            RETURNING id INTO v_categoria_id;
        END IF;

        -- Criar lançamento no financeiro geral
        INSERT INTO financeiro_lancamentos (
            tipo,
            categoria_id,
            descricao,
            valor,
            data_vencimento,
            data_competencia,
            status,
            pessoa_id,
            empresa_id,
            observacoes,
            origem,
            origem_id
        ) VALUES (
            NEW.natureza,
            v_categoria_id,
            '[JURÍDICO] ' || NEW.descricao,
            NEW.valor,
            NEW.data_vencimento,
            NEW.data_competencia,
            NEW.status,
            NEW.pessoa_id,
            NEW.empresa_id,
            'Lançamento originado do módulo Jurídico. Tipo: ' || NEW.tipo,
            'JURIDICO',
            NEW.id
        )
        RETURNING id INTO v_lancamento_id;

        -- Atualizar o registro jurídico com o ID do lançamento
        NEW.sincronizado_financeiro = TRUE;
        NEW.financeiro_lancamento_id = v_lancamento_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronização automática
DROP TRIGGER IF EXISTS trigger_sincronizar_financeiro_juridico ON financeiro_juridico;
CREATE TRIGGER trigger_sincronizar_financeiro_juridico
    BEFORE INSERT OR UPDATE ON financeiro_juridico
    FOR EACH ROW EXECUTE FUNCTION sincronizar_financeiro_juridico();

-- =============================================
-- 5. FUNÇÃO: Atualizar status de pagamento
-- =============================================

CREATE OR REPLACE FUNCTION atualizar_status_pagamento_juridico()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando pago, atualiza o registro do jurídico também
    IF NEW.status = 'PAGO' AND OLD.status != 'PAGO' THEN
        UPDATE financeiro_juridico
        SET
            status = 'PAGO',
            data_pagamento = COALESCE(NEW.data_pagamento, CURRENT_DATE),
            valor_pago = NEW.valor
        WHERE financeiro_lancamento_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger no financeiro geral para atualizar o jurídico
DROP TRIGGER IF EXISTS trigger_atualizar_pagamento_juridico ON financeiro_lancamentos;
CREATE TRIGGER trigger_atualizar_pagamento_juridico
    AFTER UPDATE ON financeiro_lancamentos
    FOR EACH ROW
    WHEN (NEW.origem = 'JURIDICO')
    EXECUTE FUNCTION atualizar_status_pagamento_juridico();

-- =============================================
-- 6. VIEW: Resumo Financeiro Jurídico
-- =============================================

CREATE OR REPLACE VIEW vw_financeiro_juridico_resumo AS
SELECT
    DATE_TRUNC('month', data_competencia) AS mes,
    COUNT(*) AS total_lancamentos,
    SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE 0 END) AS total_receitas,
    SUM(CASE WHEN natureza = 'DESPESA' THEN valor ELSE 0 END) AS total_despesas,
    SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE -valor END) AS saldo,
    SUM(CASE WHEN status = 'PAGO' THEN valor_pago ELSE 0 END) AS total_pago,
    SUM(CASE WHEN status IN ('PENDENTE', 'ATRASADO') THEN valor - COALESCE(valor_pago, 0) ELSE 0 END) AS total_a_receber,
    SUM(CASE WHEN status = 'ATRASADO' THEN valor - COALESCE(valor_pago, 0) ELSE 0 END) AS total_atrasado,
    COUNT(CASE WHEN status = 'ATRASADO' THEN 1 END) AS qtd_atrasados
FROM financeiro_juridico
WHERE status != 'CANCELADO'
GROUP BY DATE_TRUNC('month', data_competencia)
ORDER BY mes DESC;

-- =============================================
-- 7. VIEW: Lançamentos detalhados com pessoa
-- =============================================

CREATE OR REPLACE VIEW vw_financeiro_juridico_detalhado AS
SELECT
    fj.*,
    p.nome AS pessoa_nome,
    p.tipo AS pessoa_tipo,
    p.cpf AS pessoa_cpf,
    p.cnpj AS pessoa_cnpj,
    e.razao_social AS empresa_nome,
    aj.titulo AS assistencia_titulo,
    aj.numero_processo,
    c.numero AS contrato_numero,
    -- Dias em atraso
    CASE
        WHEN fj.status IN ('PENDENTE', 'ATRASADO') AND fj.data_vencimento < CURRENT_DATE
        THEN CURRENT_DATE - fj.data_vencimento
        ELSE 0
    END AS dias_atraso
FROM financeiro_juridico fj
LEFT JOIN pessoas p ON p.id = fj.pessoa_id
LEFT JOIN empresas_grupo e ON e.id = fj.empresa_id
LEFT JOIN assistencia_juridica aj ON aj.id = fj.assistencia_id
LEFT JOIN contratos c ON c.id = fj.contrato_id;

-- =============================================
-- 8. RLS (Row Level Security)
-- =============================================

-- Habilitar RLS
ALTER TABLE assistencia_juridica ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistencia_juridica_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_juridico ENABLE ROW LEVEL SECURITY;

-- Políticas para assistencia_juridica
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
-- 9. Comentários nas tabelas
-- =============================================

COMMENT ON TABLE assistencia_juridica IS 'Solicitações de assistência e intermediação jurídica';
COMMENT ON TABLE assistencia_juridica_historico IS 'Histórico de movimentações das assistências jurídicas';
COMMENT ON TABLE financeiro_juridico IS 'Lançamentos financeiros do departamento jurídico';

COMMENT ON COLUMN financeiro_juridico.tipo IS 'HONORARIO, CUSTAS, TAXA, ACORDO, MULTA, OUTROS, MENSALIDADE';
COMMENT ON COLUMN financeiro_juridico.natureza IS 'RECEITA (entrada) ou DESPESA (saída)';
COMMENT ON COLUMN financeiro_juridico.sincronizado_financeiro IS 'Indica se foi criado lançamento no financeiro geral';

-- =============================================
-- FIM DO SCRIPT
-- =============================================
