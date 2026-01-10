-- ============================================================
-- MIGRAÇÃO: Sócios das Empresas e Integração com Google Drive
-- Sistema WG Easy - Grupo WG Almeida
-- ============================================================

-- Adicionar campo de pasta do Google Drive nas empresas
ALTER TABLE empresas_grupo
ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT,
ADD COLUMN IF NOT EXISTS google_drive_folder_url TEXT;

-- Comentários
COMMENT ON COLUMN empresas_grupo.google_drive_folder_id IS 'ID da pasta no Google Drive para documentos da empresa';
COMMENT ON COLUMN empresas_grupo.google_drive_folder_url IS 'URL da pasta no Google Drive';

-- ============================================================
-- TABELA: Sócios das Empresas (Pessoas Físicas)
-- ============================================================

CREATE TABLE IF NOT EXISTS socios_empresas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Dados Pessoais
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE,
    nacionalidade VARCHAR(100) DEFAULT 'Brasileiro(a)',
    estado_civil VARCHAR(50),
    profissao VARCHAR(100),

    -- Contato
    email VARCHAR(255),
    telefone VARCHAR(20),

    -- Endereço
    cep VARCHAR(10),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),

    -- Vínculo com Empresa(s)
    -- Um sócio pode ter participação em múltiplas empresas

    -- Google Drive para documentos pessoais
    google_drive_folder_id TEXT,
    google_drive_folder_url TEXT,

    -- Observações
    observacoes TEXT,

    -- Status
    ativo BOOLEAN DEFAULT TRUE,

    -- Auditoria
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_por UUID REFERENCES auth.users(id)
);

-- ============================================================
-- TABELA: Participações (Relacionamento Sócio <-> Empresa)
-- ============================================================

CREATE TABLE IF NOT EXISTS socios_participacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Vínculos
    socio_id UUID NOT NULL REFERENCES socios_empresas(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES empresas_grupo(id) ON DELETE CASCADE,

    -- Dados da Participação
    tipo_participacao VARCHAR(50) DEFAULT 'socio', -- socio, administrador, procurador, representante
    percentual_participacao DECIMAL(5,2), -- Ex: 50.00 para 50%
    data_entrada DATE,
    data_saida DATE,

    -- Poderes
    tem_poderes_gerencia BOOLEAN DEFAULT FALSE,
    tem_assinatura_contrato BOOLEAN DEFAULT FALSE,
    tem_representacao_legal BOOLEAN DEFAULT FALSE,

    -- Status
    ativo BOOLEAN DEFAULT TRUE,

    -- Auditoria
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_por UUID REFERENCES auth.users(id),

    -- Garantir que não haja duplicidade
    UNIQUE(socio_id, empresa_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_socios_empresas_cpf ON socios_empresas(cpf);
CREATE INDEX IF NOT EXISTS idx_socios_empresas_nome ON socios_empresas(nome);
CREATE INDEX IF NOT EXISTS idx_socios_empresas_ativo ON socios_empresas(ativo);

CREATE INDEX IF NOT EXISTS idx_socios_participacoes_socio ON socios_participacoes(socio_id);
CREATE INDEX IF NOT EXISTS idx_socios_participacoes_empresa ON socios_participacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_socios_participacoes_ativo ON socios_participacoes(ativo);

-- ============================================================
-- TRIGGERS: Atualização automática de atualizado_em
-- ============================================================

CREATE OR REPLACE FUNCTION update_socios_empresas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_socios_participacoes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_socios_empresas_timestamp ON socios_empresas;
CREATE TRIGGER trigger_update_socios_empresas_timestamp
    BEFORE UPDATE ON socios_empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_socios_empresas_timestamp();

DROP TRIGGER IF EXISTS trigger_update_socios_participacoes_timestamp ON socios_participacoes;
CREATE TRIGGER trigger_update_socios_participacoes_timestamp
    BEFORE UPDATE ON socios_participacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_socios_participacoes_timestamp();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE socios_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios_participacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para socios_empresas
DROP POLICY IF EXISTS "socios_empresas_select" ON socios_empresas;
CREATE POLICY "socios_empresas_select" ON socios_empresas
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "socios_empresas_insert" ON socios_empresas;
CREATE POLICY "socios_empresas_insert" ON socios_empresas
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "socios_empresas_update" ON socios_empresas;
CREATE POLICY "socios_empresas_update" ON socios_empresas
    FOR UPDATE TO authenticated
    USING (true);

DROP POLICY IF EXISTS "socios_empresas_delete" ON socios_empresas;
CREATE POLICY "socios_empresas_delete" ON socios_empresas
    FOR DELETE TO authenticated
    USING (true);

-- Políticas para socios_participacoes
DROP POLICY IF EXISTS "socios_participacoes_select" ON socios_participacoes;
CREATE POLICY "socios_participacoes_select" ON socios_participacoes
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "socios_participacoes_insert" ON socios_participacoes;
CREATE POLICY "socios_participacoes_insert" ON socios_participacoes
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "socios_participacoes_update" ON socios_participacoes;
CREATE POLICY "socios_participacoes_update" ON socios_participacoes
    FOR UPDATE TO authenticated
    USING (true);

DROP POLICY IF EXISTS "socios_participacoes_delete" ON socios_participacoes;
CREATE POLICY "socios_participacoes_delete" ON socios_participacoes
    FOR DELETE TO authenticated
    USING (true);

-- ============================================================
-- COMENTÁRIOS
-- ============================================================

COMMENT ON TABLE socios_empresas IS 'Cadastro de sócios/pessoas físicas das empresas do grupo';
COMMENT ON TABLE socios_participacoes IS 'Relacionamento entre sócios e empresas com dados de participação';

COMMENT ON COLUMN socios_participacoes.tipo_participacao IS 'Tipo: socio, administrador, procurador, representante';
COMMENT ON COLUMN socios_participacoes.percentual_participacao IS 'Percentual de participação societária (ex: 50.00 = 50%)';
