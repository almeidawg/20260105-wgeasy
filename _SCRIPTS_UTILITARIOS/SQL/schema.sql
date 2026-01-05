-- ============================================================================
-- SISTEMA WGEASY - SCHEMA COMPLETO DO BANCO DE DADOS (PostgreSQL/Supabase)
-- Exportado em: 2025-12-25
-- ============================================================================

-- ============================================================================
-- TIPOS ENUM
-- ============================================================================

-- Status de solicitacao de pagamento
DO $$ BEGIN
    CREATE TYPE status_solicitacao_pagamento AS ENUM (
        'rascunho',
        'solicitado',
        'em_analise',
        'aprovado',
        'rejeitado',
        'pago',
        'cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de solicitacao de pagamento
DO $$ BEGIN
    CREATE TYPE tipo_solicitacao_pagamento AS ENUM (
        'prestador',
        'fornecedor',
        'reembolso',
        'comissao',
        'honorario',
        'outros'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de valor a receber
DO $$ BEGIN
    CREATE TYPE tipo_valor_receber AS ENUM (
        'comissao',
        'honorario',
        'fee_projeto',
        'bonus',
        'repasse',
        'outros'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status do valor a receber
DO $$ BEGIN
    CREATE TYPE status_valor_receber AS ENUM (
        'previsto',
        'aprovado',
        'liberado',
        'pago',
        'cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status da cotacao
DO $$ BEGIN
    CREATE TYPE status_cotacao AS ENUM (
        'aberta',
        'em_andamento',
        'encerrada',
        'cancelada'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status da proposta do fornecedor
DO $$ BEGIN
    CREATE TYPE status_proposta_fornecedor AS ENUM (
        'rascunho',
        'enviada',
        'em_analise',
        'aprovada',
        'rejeitada',
        'vencedora'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status do servico contratado
DO $$ BEGIN
    CREATE TYPE status_servico_contratado AS ENUM (
        'contratado',
        'em_execucao',
        'pausado',
        'concluido',
        'cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipos de acao para auditoria
DO $$ BEGIN
    CREATE TYPE tipo_acao_auditoria AS ENUM (
        'criar',
        'editar',
        'excluir',
        'aprovar',
        'rejeitar',
        'enviar',
        'visualizar',
        'download',
        'upload',
        'login',
        'logout'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABELAS AUXILIARES E LOOKUP
-- ============================================================================

-- ============================================================================
-- TABELA: nucleos
-- Unidades de negocio / centros de custo
-- ============================================================================
CREATE TABLE IF NOT EXISTS nucleos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    cor VARCHAR(20) DEFAULT '#F25C26',
    icone VARCHAR(50),
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nucleos_ativo ON nucleos(ativo);
CREATE INDEX IF NOT EXISTS idx_nucleos_ordem ON nucleos(ordem);

-- ============================================================================
-- TABELA: fin_categories
-- Categorias financeiras (receitas e despesas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS fin_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('income', 'expense')),
    parent_id UUID REFERENCES fin_categories(id) ON DELETE SET NULL,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_categories_kind ON fin_categories(kind);
CREATE INDEX IF NOT EXISTS idx_fin_categories_parent ON fin_categories(parent_id);

-- ============================================================================
-- TABELA: pricelist_categorias
-- Categorias do catalogo de produtos/servicos
-- ============================================================================
CREATE TABLE IF NOT EXISTS pricelist_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    codigo VARCHAR(50),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('mao_obra', 'material', 'servico', 'produto')),
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricelist_categorias_tipo ON pricelist_categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_pricelist_categorias_ativo ON pricelist_categorias(ativo);
CREATE INDEX IF NOT EXISTS idx_pricelist_categorias_ordem ON pricelist_categorias(ordem);

-- ============================================================================
-- TABELA: pricelist_itens
-- Itens do catalogo de produtos/servicos (mao de obra e materiais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pricelist_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES pricelist_categorias(id) ON DELETE SET NULL,
    subcategoria_id UUID REFERENCES pricelist_subcategorias(id) ON DELETE SET NULL,
    nucleo_id UUID REFERENCES nucleos(id) ON DELETE SET NULL,

    -- Identificacao
    codigo VARCHAR(50),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('mao_obra', 'material', 'servico', 'produto')),

    -- Unidade e preco
    unidade VARCHAR(20) NOT NULL DEFAULT 'un',
    preco DECIMAL(15,2) NOT NULL DEFAULT 0,
    producao_diaria DECIMAL(15,3), -- Quantidade executada por dia

    -- Custos e margem
    custo_aquisicao DECIMAL(15,2),
    margem_lucro DECIMAL(5,2),
    markup DECIMAL(5,2),
    preco_minimo DECIMAL(15,2),
    custo_operacional DECIMAL(15,2),
    lucro_estimado DECIMAL(15,2),

    -- Dimensoes fisicas (para revestimentos/porcelanatos)
    espessura DECIMAL(10,2),
    largura DECIMAL(10,2),
    comprimento DECIMAL(10,2),
    peso DECIMAL(10,2),

    -- Metragem e rendimento
    m2_peca DECIMAL(10,4),
    m2_caixa DECIMAL(10,4),
    unidades_caixa INTEGER,
    rendimento DECIMAL(10,4),

    -- Classificacao do produto
    aplicacao VARCHAR(50),
    ambiente VARCHAR(50),
    acabamento VARCHAR(50),
    formato VARCHAR(50),
    borda VARCHAR(50),
    resistencia VARCHAR(20),
    cor VARCHAR(100),

    -- Informacoes do fabricante
    fabricante VARCHAR(200),
    linha VARCHAR(200),
    modelo VARCHAR(200),
    codigo_fabricante VARCHAR(100),
    link_produto TEXT,

    -- Comercializacao
    unidade_venda VARCHAR(20),
    multiplo_venda DECIMAL(10,2),
    preco_m2 DECIMAL(15,2),
    preco_caixa DECIMAL(15,2),

    -- Informacoes adicionais
    fornecedor_id UUID REFERENCES pessoas(id) ON DELETE SET NULL,
    marca VARCHAR(200),
    especificacoes JSONB,
    imagem_url TEXT,

    -- Avaliacao
    avaliacao DECIMAL(3,2),
    total_avaliacoes INTEGER DEFAULT 0,

    -- Estoque
    controla_estoque BOOLEAN DEFAULT false,
    estoque_minimo DECIMAL(15,3),
    estoque_atual DECIMAL(15,3),

    -- Status
    ativo BOOLEAN DEFAULT true,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricelist_itens_categoria ON pricelist_itens(categoria_id);
CREATE INDEX IF NOT EXISTS idx_pricelist_itens_subcategoria ON pricelist_itens(subcategoria_id);
CREATE INDEX IF NOT EXISTS idx_pricelist_itens_tipo ON pricelist_itens(tipo);
CREATE INDEX IF NOT EXISTS idx_pricelist_itens_codigo ON pricelist_itens(codigo);
CREATE INDEX IF NOT EXISTS idx_pricelist_itens_fornecedor ON pricelist_itens(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pricelist_itens_ativo ON pricelist_itens(ativo);

-- ============================================================================
-- TABELA: contratos_etapas
-- Etapas de execucao dos contratos
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE status_etapa AS ENUM ('pendente', 'em_andamento', 'concluida', 'atrasada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS contratos_etapas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,

    ordem INTEGER NOT NULL DEFAULT 1,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,

    -- Prazos
    prazo_dias_uteis INTEGER,
    data_inicio_prevista DATE,
    data_termino_prevista DATE,
    data_inicio_real DATE,
    data_termino_real DATE,

    -- Pagamento vinculado a etapa
    percentual_pagamento DECIMAL(5,2),
    valor_pagamento DECIMAL(15,2),
    pago BOOLEAN DEFAULT false,
    data_pagamento TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'atrasada', 'cancelada')),
    observacoes TEXT,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_etapas_contrato ON contratos_etapas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_contratos_etapas_status ON contratos_etapas(status);
CREATE INDEX IF NOT EXISTS idx_contratos_etapas_ordem ON contratos_etapas(contrato_id, ordem);

-- ============================================================================
-- TABELA: contratos_etapas_padrao
-- Templates de etapas por nucleo
-- ============================================================================
CREATE TABLE IF NOT EXISTS contratos_etapas_padrao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_negocio VARCHAR(20) NOT NULL CHECK (unidade_negocio IN ('arquitetura', 'engenharia', 'marcenaria')),
    ordem INTEGER NOT NULL DEFAULT 1,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    percentual_prazo DECIMAL(5,2), -- % do prazo total
    percentual_pagamento DECIMAL(5,2), -- % do valor para pagamento
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_etapas_padrao_unidade ON contratos_etapas_padrao(unidade_negocio);
CREATE INDEX IF NOT EXISTS idx_etapas_padrao_ordem ON contratos_etapas_padrao(unidade_negocio, ordem);

-- ============================================================================
-- TABELA: contratos_pagamentos
-- Parcelas e pagamentos dos contratos
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE status_pagamento_contrato AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS contratos_pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    etapa_id UUID REFERENCES contratos_etapas(id) ON DELETE SET NULL,

    numero_parcela INTEGER,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,

    forma_pagamento VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    observacoes TEXT,

    -- Vinculo com lancamento financeiro
    lancamento_id UUID REFERENCES financeiro_lancamentos(id) ON DELETE SET NULL,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_pagamentos_contrato ON contratos_pagamentos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_contratos_pagamentos_etapa ON contratos_pagamentos(etapa_id);
CREATE INDEX IF NOT EXISTS idx_contratos_pagamentos_status ON contratos_pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_pagamentos_vencimento ON contratos_pagamentos(data_vencimento);

-- ============================================================================
-- TABELA: followups
-- Acompanhamento de oportunidades (CRM)
-- ============================================================================
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
        'ligacao', 'email', 'reuniao', 'visita', 'whatsapp', 'proposta', 'anotacao', 'outro'
    )),
    titulo VARCHAR(255),
    descricao TEXT,
    data_followup TIMESTAMPTZ DEFAULT NOW(),
    data_proximo_contato DATE,
    resultado VARCHAR(100),
    concluido BOOLEAN DEFAULT false,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_followups_oportunidade ON followups(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_followups_usuario ON followups(usuario_id);
CREATE INDEX IF NOT EXISTS idx_followups_tipo ON followups(tipo);
CREATE INDEX IF NOT EXISTS idx_followups_data ON followups(data_followup);
CREATE INDEX IF NOT EXISTS idx_followups_proximo ON followups(data_proximo_contato);

-- ============================================================================
-- TABELAS PRINCIPAIS DO SISTEMA
-- ============================================================================

-- ============================================================================
-- TABELA: pessoas
-- Armazena todas as entidades: clientes, colaboradores, fornecedores, especificadores
-- ============================================================================
CREATE TABLE IF NOT EXISTS pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    cpf VARCHAR(20),
    cnpj VARCHAR(20),
    rg VARCHAR(30),
    nacionalidade VARCHAR(100),
    estado_civil VARCHAR(50),
    profissao VARCHAR(100),
    cargo VARCHAR(100),
    empresa VARCHAR(255),
    unidade VARCHAR(100),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('CLIENTE', 'COLABORADOR', 'FORNECEDOR', 'ESPECIFICADOR')),

    -- Endereco completo
    cep VARCHAR(15),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    pais VARCHAR(100) DEFAULT 'Brasil',

    -- Endereco da obra (para clientes)
    obra_endereco_diferente BOOLEAN DEFAULT false,
    obra_cep VARCHAR(15),
    obra_logradouro VARCHAR(255),
    obra_numero VARCHAR(20),
    obra_complemento VARCHAR(100),
    obra_bairro VARCHAR(100),
    obra_cidade VARCHAR(100),
    obra_estado VARCHAR(50),

    -- Dados bancarios (fornecedores e especificadores)
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(20),
    pix VARCHAR(100),

    -- Informacoes adicionais
    contato_responsavel VARCHAR(255),
    observacoes TEXT,
    avatar_url TEXT,
    foto_url TEXT,

    -- Vinculo com perfil de colaborador
    colaborador_perfil_id UUID REFERENCES colaborador_perfis(id),

    -- Status e auditoria
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pessoas_tipo ON pessoas(tipo);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas(email);
CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON pessoas(cpf);
CREATE INDEX IF NOT EXISTS idx_pessoas_cnpj ON pessoas(cnpj);
CREATE INDEX IF NOT EXISTS idx_pessoas_ativo ON pessoas(ativo);

-- ============================================================================
-- TABELA: usuarios
-- Gerencia usuarios do sistema com autenticacao Supabase Auth
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    cpf VARCHAR(20) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN (
        'MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO', 'COLABORADOR',
        'CLIENTE', 'ESPECIFICADOR', 'FORNECEDOR', 'JURIDICO', 'FINANCEIRO'
    )),
    ativo BOOLEAN DEFAULT true,
    primeiro_acesso BOOLEAN DEFAULT true,
    nucleo_id UUID REFERENCES nucleos(id) ON DELETE SET NULL,

    -- Permissoes do cliente
    cliente_pode_ver_valores BOOLEAN DEFAULT false,
    cliente_pode_ver_cronograma BOOLEAN DEFAULT true,
    cliente_pode_ver_documentos BOOLEAN DEFAULT true,
    cliente_pode_ver_proposta BOOLEAN DEFAULT true,
    cliente_pode_ver_contratos BOOLEAN DEFAULT true,
    cliente_pode_fazer_upload BOOLEAN DEFAULT true,
    cliente_pode_comentar BOOLEAN DEFAULT true,

    -- Dados de contato
    telefone_whatsapp VARCHAR(50),
    email_contato VARCHAR(255),

    -- Auditoria
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    ultimo_acesso TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_pessoa_id ON usuarios(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);

-- ============================================================================
-- TABELA: oportunidades
-- Pipeline de vendas (CRM)
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE estagio_oportunidade AS ENUM (
        'qualificacao',
        'proposta',
        'negociacao',
        'fechamento'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_oportunidade AS ENUM (
        'novo',
        'em_andamento',
        'proposta_enviada',
        'negociacao',
        'ganho',
        'perdido',
        'cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    cliente_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    descricao TEXT,
    valor DECIMAL(15,2),
    moeda VARCHAR(10) DEFAULT 'BRL',
    estagio VARCHAR(20) CHECK (estagio IN ('qualificacao', 'proposta', 'negociacao', 'fechamento')),
    status VARCHAR(20) DEFAULT 'novo' CHECK (status IN (
        'novo', 'em_andamento', 'proposta_enviada', 'negociacao', 'ganho', 'perdido', 'cancelado'
    )),
    origem VARCHAR(100),
    responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    data_abertura DATE DEFAULT CURRENT_DATE,
    data_fechamento_prevista DATE,
    data_fechamento_real DATE,
    observacoes TEXT,

    -- Regras de obra (condominio)
    condominio_nome VARCHAR(255),
    condominio_contato VARCHAR(255),
    obra_seg_sex_entrada TIME,
    obra_seg_sex_saida TIME,
    obra_sab_entrada TIME,
    obra_sab_saida TIME,
    obra_regras_obs TEXT,

    -- Auditoria
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_cliente ON oportunidades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_status ON oportunidades(status);
CREATE INDEX IF NOT EXISTS idx_oportunidades_estagio ON oportunidades(estagio);
CREATE INDEX IF NOT EXISTS idx_oportunidades_responsavel ON oportunidades(responsavel_id);

-- ============================================================================
-- TABELA: contratos
-- Contratos firmados com clientes
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE unidade_negocio AS ENUM ('arquitetura', 'engenharia', 'marcenaria');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_contrato AS ENUM (
        'rascunho',
        'aguardando_assinatura',
        'ativo',
        'concluido',
        'cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    oportunidade_id UUID REFERENCES oportunidades(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES pessoas(id) ON DELETE SET NULL,
    unidade_negocio VARCHAR(20) NOT NULL CHECK (unidade_negocio IN ('arquitetura', 'engenharia', 'marcenaria')),

    -- Valores
    valor_total DECIMAL(15,2) DEFAULT 0,
    valor_mao_obra DECIMAL(15,2) DEFAULT 0,
    valor_materiais DECIMAL(15,2) DEFAULT 0,

    -- Status e datas
    status VARCHAR(30) DEFAULT 'rascunho' CHECK (status IN (
        'rascunho', 'aguardando_assinatura', 'ativo', 'concluido', 'cancelado'
    )),
    data_inicio DATE,
    data_previsao_termino DATE,
    data_termino_real DATE,

    -- Documentos
    documento_url TEXT,
    assinatura_cliente_base64 TEXT,
    assinatura_responsavel_base64 TEXT,
    data_assinatura TIMESTAMPTZ,

    -- Relacionamentos
    obra_id UUID,
    cronograma_id UUID,

    -- Descricao e condicoes
    descricao TEXT,
    titulo VARCHAR(255),
    prazo_entrega_dias INTEGER,
    observacoes TEXT,
    condicoes_contratuais TEXT,

    -- Dados cacheados para PDF
    dados_cliente_json JSONB,
    dados_imovel_json JSONB,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_oportunidade ON contratos(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_unidade ON contratos(unidade_negocio);
CREATE INDEX IF NOT EXISTS idx_contratos_numero ON contratos(numero);

-- ============================================================================
-- TABELA: contratos_itens
-- Itens dos contratos (mao de obra e materiais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contratos_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('mao_obra', 'material')),
    pricelist_item_id UUID,
    descricao TEXT NOT NULL,
    quantidade DECIMAL(15,3) NOT NULL DEFAULT 1,
    unidade VARCHAR(20) DEFAULT 'un',
    valor_unitario DECIMAL(15,2) NOT NULL DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    producao_diaria DECIMAL(15,3),
    dias_estimados INTEGER,
    percentual_valor DECIMAL(5,2),
    ordem_execucao INTEGER DEFAULT 0,
    especificacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_itens_contrato ON contratos_itens(contrato_id);
CREATE INDEX IF NOT EXISTS idx_contratos_itens_tipo ON contratos_itens(tipo);

-- ============================================================================
-- TABELA: financeiro_lancamentos
-- Lancamentos financeiros (entradas e saidas)
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE tipo_lancamento AS ENUM ('entrada', 'saida');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_lancamento AS ENUM ('pendente', 'parcialmente_pago', 'pago', 'atrasado', 'cancelado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS financeiro_lancamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) UNIQUE,
    descricao TEXT NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    categoria_id UUID REFERENCES fin_categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN (
        'pendente', 'parcialmente_pago', 'pago', 'atrasado', 'cancelado'
    )),

    -- Nucleo / unidade de negocio
    nucleo VARCHAR(50),
    unidade_negocio VARCHAR(50),

    -- Datas
    data_competencia DATE DEFAULT CURRENT_DATE,
    vencimento DATE,
    data_pagamento DATE,

    -- Relacionamentos
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
    pessoa_id UUID REFERENCES pessoas(id) ON DELETE SET NULL,

    -- Referencia generica
    referencia_tipo VARCHAR(50),
    referencia_id UUID,

    -- Pagamento
    conta_bancaria VARCHAR(100),
    forma_pagamento VARCHAR(50),
    comprovante_url TEXT,

    -- Observacoes
    observacoes TEXT,

    -- Aprovacao
    approval_status VARCHAR(20) DEFAULT 'pendente' CHECK (approval_status IN ('pendente', 'aprovado', 'rejeitado')),
    approval_user_id UUID REFERENCES auth.users(id),
    approval_at TIMESTAMPTZ,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_tipo ON financeiro_lancamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_status ON financeiro_lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_contrato ON financeiro_lancamentos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_projeto ON financeiro_lancamentos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_pessoa ON financeiro_lancamentos(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_data ON financeiro_lancamentos(data_competencia);
CREATE INDEX IF NOT EXISTS idx_fin_lancamentos_vencimento ON financeiro_lancamentos(vencimento);

-- ============================================================================
-- TABELA: projetos
-- Projetos criados a partir de contratos ativados
-- ============================================================================
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES pessoas(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido', 'cancelado')),
    data_inicio DATE,
    data_previsao_termino DATE,
    data_conclusao DATE,
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    nucleo VARCHAR(50),
    unidade_negocio VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projetos_contrato ON projetos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_projetos_cliente ON projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);

-- ============================================================================
-- TABELAS BASE
-- ============================================================================

-- Tabela de perfis de colaborador (RBAC)
CREATE TABLE IF NOT EXISTS colaborador_perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    nivel_hierarquico INTEGER DEFAULT 1, -- 1=operacional, 2=coordenacao, 3=gerencia, 4=diretoria
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vincular colaborador a perfil (coluna adicional em pessoas)
-- ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS colaborador_perfil_id UUID REFERENCES colaborador_perfis(id);

-- ============================================================================
-- COLABORADORES E PROJETOS
-- ============================================================================

-- Tabela de vinculo colaborador-projeto
CREATE TABLE IF NOT EXISTS colaborador_projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    projeto_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    funcao VARCHAR(100),
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    UNIQUE(colaborador_id, projeto_id)
);

CREATE INDEX IF NOT EXISTS idx_colab_proj_colaborador ON colaborador_projetos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_colab_proj_projeto ON colaborador_projetos(projeto_id);

-- ============================================================================
-- SOLICITACOES DE PAGAMENTO
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS seq_solicitacao_pagamento START 1;

CREATE TABLE IF NOT EXISTS solicitacoes_pagamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_solicitacao VARCHAR(20) UNIQUE,
    solicitante_id UUID NOT NULL REFERENCES pessoas(id),
    projeto_id UUID REFERENCES contratos(id),
    beneficiario_id UUID REFERENCES pessoas(id),
    beneficiario_nome VARCHAR(200),
    beneficiario_documento VARCHAR(20),
    tipo tipo_solicitacao_pagamento NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(20),
    chave_pix VARCHAR(100),
    data_vencimento DATE,
    data_pagamento DATE,
    status status_solicitacao_pagamento DEFAULT 'rascunho',
    aprovado_por UUID REFERENCES auth.users(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    motivo_rejeicao TEXT,
    lancamento_id UUID,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_por UUID REFERENCES auth.users(id)
);

-- Anexos de solicitacao
CREATE TABLE IF NOT EXISTS solicitacoes_pagamento_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id UUID NOT NULL REFERENCES solicitacoes_pagamento(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    arquivo_url TEXT NOT NULL,
    tamanho_bytes INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id)
);

-- Historico de aprovacoes
CREATE TABLE IF NOT EXISTS solicitacoes_pagamento_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id UUID NOT NULL REFERENCES solicitacoes_pagamento(id) ON DELETE CASCADE,
    status_anterior status_solicitacao_pagamento,
    status_novo status_solicitacao_pagamento NOT NULL,
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- VALORES A RECEBER DO COLABORADOR
-- ============================================================================

CREATE TABLE IF NOT EXISTS colaborador_valores_receber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES contratos(id),
    parcela_id UUID,
    tipo tipo_valor_receber NOT NULL,
    descricao TEXT,
    valor DECIMAL(15,2) NOT NULL,
    percentual DECIMAL(5,2),
    condicao_liberacao TEXT,
    data_prevista DATE,
    data_liberacao DATE,
    data_pagamento DATE,
    status status_valor_receber DEFAULT 'previsto',
    solicitacao_pagamento_id UUID REFERENCES solicitacoes_pagamento(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REGISTROS DE OBRA
-- ============================================================================

CREATE TABLE IF NOT EXISTS obra_registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    colaborador_id UUID NOT NULL REFERENCES pessoas(id),
    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    titulo VARCHAR(200),
    descricao TEXT,
    etapa_cronograma_id UUID,
    percentual_avanco DECIMAL(5,2),
    clima VARCHAR(50),
    equipe_presente INTEGER,
    observacoes TEXT,
    pendencias TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS obra_registros_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID NOT NULL REFERENCES obra_registros(id) ON DELETE CASCADE,
    arquivo_url TEXT NOT NULL,
    descricao VARCHAR(255),
    ordem INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS obra_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    etapa VARCHAR(100),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS obra_checklist_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES obra_checklists(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    ordem INTEGER DEFAULT 0,
    obrigatorio BOOLEAN DEFAULT false,
    concluido BOOLEAN DEFAULT false,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    concluido_por UUID REFERENCES auth.users(id),
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FORNECEDORES E CATEGORIAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fornecedor_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fornecedor_categoria_vinculo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fornecedor_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES fornecedor_categorias(id) ON DELETE CASCADE,
    principal BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fornecedor_id, categoria_id)
);

-- ============================================================================
-- COTACOES
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS seq_cotacao START 1;

CREATE TABLE IF NOT EXISTS cotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_cotacao VARCHAR(20) UNIQUE,
    projeto_id UUID REFERENCES contratos(id),
    projeto_nome VARCHAR(200),
    categoria_id UUID NOT NULL REFERENCES fornecedor_categorias(id),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_limite TIMESTAMP WITH TIME ZONE NOT NULL,
    prazo_execucao_dias INTEGER,
    status status_cotacao DEFAULT 'aberta',
    permite_proposta_parcial BOOLEAN DEFAULT false,
    exige_visita_tecnica BOOLEAN DEFAULT false,
    fornecedor_vencedor_id UUID REFERENCES pessoas(id),
    data_fechamento TIMESTAMP WITH TIME ZONE,
    observacao_fechamento TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotacao_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
    descricao VARCHAR(500) NOT NULL,
    unidade VARCHAR(20),
    quantidade DECIMAL(15,3),
    especificacao TEXT,
    referencia VARCHAR(200),
    ordem INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotacao_fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
    fornecedor_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    data_convite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visualizado BOOLEAN DEFAULT false,
    data_visualizacao TIMESTAMP WITH TIME ZONE,
    participando BOOLEAN,
    motivo_declinio TEXT,
    UNIQUE(cotacao_id, fornecedor_id)
);

CREATE TABLE IF NOT EXISTS cotacao_propostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
    fornecedor_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    valor_total DECIMAL(15,2) NOT NULL,
    prazo_execucao_dias INTEGER,
    validade_proposta_dias INTEGER DEFAULT 30,
    condicoes_pagamento TEXT,
    observacoes TEXT,
    garantia_meses INTEGER,
    descricao_garantia TEXT,
    status status_proposta_fornecedor DEFAULT 'rascunho',
    data_envio TIMESTAMP WITH TIME ZONE,
    nota_interna INTEGER CHECK (nota_interna >= 1 AND nota_interna <= 5),
    comentario_interno TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cotacao_id, fornecedor_id)
);

CREATE TABLE IF NOT EXISTS cotacao_proposta_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID NOT NULL REFERENCES cotacao_propostas(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES cotacao_itens(id) ON DELETE CASCADE,
    valor_unitario DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    marca_modelo VARCHAR(200),
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposta_id, item_id)
);

CREATE TABLE IF NOT EXISTS cotacao_proposta_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID NOT NULL REFERENCES cotacao_propostas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    arquivo_url TEXT NOT NULL,
    tamanho_bytes INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SERVICOS CONTRATADOS COM FORNECEDORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS fornecedor_servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fornecedor_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    projeto_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    cotacao_id UUID REFERENCES cotacoes(id),
    proposta_id UUID REFERENCES cotacao_propostas(id),
    descricao TEXT NOT NULL,
    categoria_id UUID REFERENCES fornecedor_categorias(id),
    valor_contratado DECIMAL(15,2) NOT NULL,
    data_contratacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_inicio_prevista DATE,
    data_fim_prevista DATE,
    data_conclusao DATE,
    status status_servico_contratado DEFAULT 'contratado',
    percentual_execucao DECIMAL(5,2) DEFAULT 0,
    condicoes_pagamento TEXT,
    garantia_meses INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fornecedor_servico_parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servico_id UUID NOT NULL REFERENCES fornecedor_servicos(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    descricao VARCHAR(200),
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE,
    condicao VARCHAR(200),
    data_pagamento DATE,
    valor_pago DECIMAL(15,2),
    comprovante_url TEXT,
    lancamento_id UUID,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUDITORIA
-- ============================================================================

CREATE TABLE IF NOT EXISTS auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id),
    pessoa_id UUID REFERENCES pessoas(id),
    acao tipo_acao_auditoria NOT NULL,
    tabela VARCHAR(100) NOT NULL,
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela ON auditoria_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado ON auditoria_logs(criado_em);

-- ============================================================================
-- CRONOGRAMA E TAREFAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cronograma_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    item_contrato_id UUID REFERENCES contratos_itens(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT,
    nucleo TEXT,
    data_inicio DATE,
    data_termino DATE,
    duracao_dias INTEGER,
    dependencias UUID[] DEFAULT ARRAY[]::UUID[],
    ordem INTEGER DEFAULT 0,
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'atrasado', 'pausado', 'cancelado')),
    prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cronograma_tarefas_projeto_id ON cronograma_tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_cronograma_tarefas_item_contrato_id ON cronograma_tarefas(item_contrato_id);
CREATE INDEX IF NOT EXISTS idx_cronograma_tarefas_nucleo ON cronograma_tarefas(nucleo);
CREATE INDEX IF NOT EXISTS idx_cronograma_tarefas_status ON cronograma_tarefas(status);
CREATE INDEX IF NOT EXISTS idx_cronograma_tarefas_ordem ON cronograma_tarefas(projeto_id, ordem);

-- ============================================================================
-- EQUIPES DE PROJETO
-- ============================================================================

CREATE TABLE IF NOT EXISTS projeto_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    tarefa_id UUID REFERENCES cronograma_tarefas(id) ON DELETE CASCADE,
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    tipo_pessoa TEXT CHECK (tipo_pessoa IN ('colaborador', 'fornecedor')),
    funcao TEXT,
    is_responsavel BOOLEAN DEFAULT false,
    horas_alocadas NUMERIC(10,2),
    custo_hora NUMERIC(10,2),
    data_inicio_alocacao DATE,
    data_fim_alocacao DATE,
    data_atribuicao TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projeto_equipes_projeto_id ON projeto_equipes(projeto_id);
CREATE INDEX IF NOT EXISTS idx_projeto_equipes_tarefa_id ON projeto_equipes(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_projeto_equipes_pessoa_id ON projeto_equipes(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_projeto_equipes_tipo_pessoa ON projeto_equipes(tipo_pessoa);
CREATE INDEX IF NOT EXISTS idx_projeto_equipes_is_responsavel ON projeto_equipes(projeto_id, is_responsavel);

-- ============================================================================
-- TEMPLATES DE CHECKLISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS checklist_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    nucleo TEXT NOT NULL CHECK (nucleo IN ('arquitetura', 'engenharia', 'marcenaria', 'geral')),
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    nucleo_id UUID REFERENCES nucleos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_checklist_templates_nucleo ON checklist_templates(nucleo, ativo);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_ordem ON checklist_templates(ordem);

CREATE TABLE IF NOT EXISTS checklist_template_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    grupo TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_items_template ON checklist_template_items(template_id, ordem);

CREATE TABLE IF NOT EXISTS cliente_checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    oportunidade_id UUID REFERENCES oportunidades(id) ON DELETE CASCADE,
    template_id UUID REFERENCES checklist_templates(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    concluido BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cliente_checklists_oportunidade ON cliente_checklists(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_cliente_checklists_template ON cliente_checklists(template_id);

CREATE TABLE IF NOT EXISTS cliente_checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    checklist_id UUID NOT NULL REFERENCES cliente_checklists(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    concluido BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    concluido_em TIMESTAMPTZ,
    concluido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON cliente_checklist_items(checklist_id, ordem);
CREATE INDEX IF NOT EXISTS idx_checklist_items_concluido ON cliente_checklist_items(concluido);

-- ============================================================================
-- PRICELIST (TABELA DE PRECOS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricelist_subcategorias (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria_id uuid NOT NULL REFERENCES pricelist_categorias(id),
    nome text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('material','mao_obra','servico','produto')),
    ordem int DEFAULT 0,
    ativo boolean DEFAULT true,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricelist_subcategorias_categoria
    ON pricelist_subcategorias(categoria_id, tipo, ativo);

-- ALTER TABLE pricelist_itens ADD COLUMN IF NOT EXISTS subcategoria_id uuid REFERENCES pricelist_subcategorias(id);
-- CREATE INDEX IF NOT EXISTS idx_pricelist_itens_subcategoria ON pricelist_itens(subcategoria_id);

-- ============================================================================
-- OPORTUNIDADES - REGRAS DE OBRAS
-- ============================================================================

-- Colunas adicionais para tabela oportunidades:
-- ALTER TABLE oportunidades
-- ADD COLUMN IF NOT EXISTS condominio_nome VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS condominio_contato VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS obra_seg_sex_entrada TIME,
-- ADD COLUMN IF NOT EXISTS obra_seg_sex_saida TIME,
-- ADD COLUMN IF NOT EXISTS obra_sab_entrada TIME,
-- ADD COLUMN IF NOT EXISTS obra_sab_saida TIME,
-- ADD COLUMN IF NOT EXISTS obra_regras_obs TEXT;

-- ============================================================================
-- FUNCOES (FUNCTIONS)
-- ============================================================================

-- Funcao para gerar numero de solicitacao
CREATE OR REPLACE FUNCTION gerar_numero_solicitacao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_solicitacao IS NULL THEN
        NEW.numero_solicitacao := 'SP-' || EXTRACT(YEAR FROM NOW()) || '-' ||
            LPAD(nextval('seq_solicitacao_pagamento')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para registrar historico de solicitacao
CREATE OR REPLACE FUNCTION registrar_historico_solicitacao()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO solicitacoes_pagamento_historico (solicitacao_id, status_anterior, status_novo, criado_por)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.atualizado_por);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para gerar numero de cotacao
CREATE OR REPLACE FUNCTION gerar_numero_cotacao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_cotacao IS NULL THEN
        NEW.numero_cotacao := 'COT-' || EXTRACT(YEAR FROM NOW()) || '-' ||
            LPAD(nextval('seq_cotacao')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para obter resumo financeiro do colaborador
CREATE OR REPLACE FUNCTION fn_resumo_financeiro_colaborador(p_colaborador_id UUID)
RETURNS TABLE (
    valor_previsto DECIMAL,
    valor_aprovado DECIMAL,
    valor_liberado DECIMAL,
    valor_pago DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN cvr.status = 'previsto' THEN cvr.valor ELSE 0 END), 0) as valor_previsto,
        COALESCE(SUM(CASE WHEN cvr.status = 'aprovado' THEN cvr.valor ELSE 0 END), 0) as valor_aprovado,
        COALESCE(SUM(CASE WHEN cvr.status = 'liberado' THEN cvr.valor ELSE 0 END), 0) as valor_liberado,
        COALESCE(SUM(CASE WHEN cvr.status = 'pago' THEN cvr.valor ELSE 0 END), 0) as valor_pago
    FROM colaborador_valores_receber cvr
    WHERE cvr.colaborador_id = p_colaborador_id;
END;
$$ LANGUAGE plpgsql;

-- Funcao para obter resumo financeiro do fornecedor
CREATE OR REPLACE FUNCTION fn_resumo_financeiro_fornecedor(p_fornecedor_id UUID)
RETURNS TABLE (
    valor_contratado DECIMAL,
    valor_pago DECIMAL,
    valor_pendente DECIMAL,
    total_servicos INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(fs.valor_contratado), 0) as valor_contratado,
        COALESCE(SUM(fsp.valor_pago), 0) as valor_pago,
        COALESCE(SUM(fs.valor_contratado), 0) - COALESCE(SUM(fsp.valor_pago), 0) as valor_pendente,
        COUNT(DISTINCT fs.id)::INTEGER as total_servicos
    FROM fornecedor_servicos fs
    LEFT JOIN fornecedor_servico_parcelas fsp ON fsp.servico_id = fs.id
    WHERE fs.fornecedor_id = p_fornecedor_id;
END;
$$ LANGUAGE plpgsql;

-- Funcao para convidar fornecedores para cotacao por categoria
CREATE OR REPLACE FUNCTION fn_convidar_fornecedores_cotacao(p_cotacao_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_categoria_id UUID;
    v_total INTEGER := 0;
BEGIN
    SELECT categoria_id INTO v_categoria_id FROM cotacoes WHERE id = p_cotacao_id;

    INSERT INTO cotacao_fornecedores (cotacao_id, fornecedor_id)
    SELECT p_cotacao_id, fcv.fornecedor_id
    FROM fornecedor_categoria_vinculo fcv
    JOIN pessoas p ON p.id = fcv.fornecedor_id AND p.ativo = true
    WHERE fcv.categoria_id = v_categoria_id
    ON CONFLICT (cotacao_id, fornecedor_id) DO NOTHING;

    GET DIAGNOSTICS v_total = ROW_COUNT;
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Funcao para calcular progresso do checklist
CREATE OR REPLACE FUNCTION calcular_progresso_checklist()
RETURNS TRIGGER AS $$
DECLARE
    total_itens INTEGER;
    itens_concluidos INTEGER;
    novo_progresso INTEGER;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE concluido = true)
    INTO total_itens, itens_concluidos
    FROM cliente_checklist_items
    WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id);

    IF total_itens > 0 THEN
        novo_progresso := ROUND((itens_concluidos::NUMERIC / total_itens::NUMERIC) * 100);
    ELSE
        novo_progresso := 0;
    END IF;

    UPDATE cliente_checklists
    SET
        progresso = novo_progresso,
        concluido = (novo_progresso = 100),
        atualizado_em = NOW()
    WHERE id = COALESCE(NEW.checklist_id, OLD.checklist_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Funcao para aplicar template em oportunidade
CREATE OR REPLACE FUNCTION aplicar_template_checklist(
    p_oportunidade_id UUID,
    p_template_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_checklist_id UUID;
    v_template_nome TEXT;
BEGIN
    SELECT nome INTO v_template_nome
    FROM checklist_templates
    WHERE id = p_template_id;

    INSERT INTO cliente_checklists (oportunidade_id, template_id, nome)
    VALUES (p_oportunidade_id, p_template_id, v_template_nome)
    RETURNING id INTO v_checklist_id;

    INSERT INTO cliente_checklist_items (checklist_id, texto, ordem)
    SELECT
        v_checklist_id,
        texto,
        ordem
    FROM checklist_template_items
    WHERE template_id = p_template_id
    ORDER BY ordem;

    RETURN v_checklist_id;
END;
$$ LANGUAGE plpgsql;

-- Funcao para atualizar updated_at em cronograma_tarefas
CREATE OR REPLACE FUNCTION atualizar_updated_at_cronograma_tarefas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para detectar tarefa atrasada
CREATE OR REPLACE FUNCTION detectar_tarefa_atrasada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_termino < CURRENT_DATE
       AND NEW.status NOT IN ('concluido', 'cancelado')
       AND (OLD.status IS NULL OR OLD.status != 'atrasado')
    THEN
        NEW.status = 'atrasado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para calcular duracao da tarefa
CREATE OR REPLACE FUNCTION calcular_duracao_tarefa()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_inicio IS NOT NULL AND NEW.data_termino IS NOT NULL THEN
        NEW.duracao_dias = (NEW.data_termino - NEW.data_inicio) + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para atualizar updated_at em projeto_equipes
CREATE OR REPLACE FUNCTION atualizar_updated_at_projeto_equipes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para preencher tipo_pessoa automaticamente
CREATE OR REPLACE FUNCTION preencher_tipo_pessoa_equipe()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_pessoa IS NULL THEN
        SELECT tipo INTO NEW.tipo_pessoa
        FROM pessoas
        WHERE id = NEW.pessoa_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_gerar_numero_solicitacao ON solicitacoes_pagamento;
CREATE TRIGGER trg_gerar_numero_solicitacao
    BEFORE INSERT ON solicitacoes_pagamento
    FOR EACH ROW
    EXECUTE FUNCTION gerar_numero_solicitacao();

DROP TRIGGER IF EXISTS trg_historico_solicitacao ON solicitacoes_pagamento;
CREATE TRIGGER trg_historico_solicitacao
    AFTER UPDATE ON solicitacoes_pagamento
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_solicitacao();

DROP TRIGGER IF EXISTS trg_gerar_numero_cotacao ON cotacoes;
CREATE TRIGGER trg_gerar_numero_cotacao
    BEFORE INSERT ON cotacoes
    FOR EACH ROW
    EXECUTE FUNCTION gerar_numero_cotacao();

DROP TRIGGER IF EXISTS trigger_calcular_progresso ON cliente_checklist_items;
CREATE TRIGGER trigger_calcular_progresso
    AFTER INSERT OR UPDATE OR DELETE ON cliente_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_checklist();

DROP TRIGGER IF EXISTS trg_atualizar_updated_at_cronograma_tarefas ON cronograma_tarefas;
CREATE TRIGGER trg_atualizar_updated_at_cronograma_tarefas
    BEFORE UPDATE ON cronograma_tarefas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_updated_at_cronograma_tarefas();

DROP TRIGGER IF EXISTS trg_detectar_tarefa_atrasada ON cronograma_tarefas;
CREATE TRIGGER trg_detectar_tarefa_atrasada
    BEFORE INSERT OR UPDATE ON cronograma_tarefas
    FOR EACH ROW
    EXECUTE FUNCTION detectar_tarefa_atrasada();

DROP TRIGGER IF EXISTS trg_calcular_duracao_tarefa ON cronograma_tarefas;
CREATE TRIGGER trg_calcular_duracao_tarefa
    BEFORE INSERT OR UPDATE ON cronograma_tarefas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_duracao_tarefa();

DROP TRIGGER IF EXISTS trg_atualizar_updated_at_projeto_equipes ON projeto_equipes;
CREATE TRIGGER trg_atualizar_updated_at_projeto_equipes
    BEFORE UPDATE ON projeto_equipes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_updated_at_projeto_equipes();

DROP TRIGGER IF EXISTS trg_preencher_tipo_pessoa_equipe ON projeto_equipes;
CREATE TRIGGER trg_preencher_tipo_pessoa_equipe
    BEFORE INSERT ON projeto_equipes
    FOR EACH ROW
    EXECUTE FUNCTION preencher_tipo_pessoa_equipe();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View de colaboradores com perfil
CREATE OR REPLACE VIEW vw_colaboradores_completo AS
SELECT
    p.id,
    p.nome,
    p.email,
    p.telefone,
    p.cpf,
    p.cargo,
    p.avatar_url,
    p.ativo,
    cp.codigo as perfil_codigo,
    cp.nome as perfil_nome,
    cp.nivel_hierarquico,
    u.auth_user_id,
    u.tipo_usuario,
    (SELECT COUNT(*) FROM colaborador_projetos cp2 WHERE cp2.colaborador_id = p.id AND cp2.ativo) as total_projetos,
    (SELECT COALESCE(SUM(cvr.valor), 0) FROM colaborador_valores_receber cvr WHERE cvr.colaborador_id = p.id AND cvr.status = 'previsto') as valor_previsto,
    (SELECT COALESCE(SUM(cvr.valor), 0) FROM colaborador_valores_receber cvr WHERE cvr.colaborador_id = p.id AND cvr.status = 'pago') as valor_recebido
FROM pessoas p
LEFT JOIN colaborador_perfis cp ON p.colaborador_perfil_id = cp.id
LEFT JOIN usuarios u ON u.pessoa_id = p.id
WHERE p.tipo = 'COLABORADOR';

-- View de fornecedores com categorias
CREATE OR REPLACE VIEW vw_fornecedores_completo AS
SELECT
    p.id,
    p.nome,
    p.email,
    p.telefone,
    p.cpf,
    p.empresa,
    p.avatar_url,
    p.ativo,
    u.auth_user_id,
    ARRAY_AGG(DISTINCT fc.nome) FILTER (WHERE fc.nome IS NOT NULL) as categorias,
    (SELECT COUNT(*) FROM fornecedor_servicos fs WHERE fs.fornecedor_id = p.id) as total_servicos,
    (SELECT COALESCE(SUM(fs.valor_contratado), 0) FROM fornecedor_servicos fs WHERE fs.fornecedor_id = p.id) as valor_total_contratado,
    (SELECT COALESCE(SUM(fsp.valor_pago), 0) FROM fornecedor_servico_parcelas fsp
        JOIN fornecedor_servicos fs2 ON fsp.servico_id = fs2.id
        WHERE fs2.fornecedor_id = p.id) as valor_total_pago
FROM pessoas p
LEFT JOIN usuarios u ON u.pessoa_id = p.id
LEFT JOIN fornecedor_categoria_vinculo fcv ON fcv.fornecedor_id = p.id
LEFT JOIN fornecedor_categorias fc ON fcv.categoria_id = fc.id
WHERE p.tipo = 'FORNECEDOR'
GROUP BY p.id, p.nome, p.email, p.telefone, p.cpf, p.empresa, p.avatar_url, p.ativo, u.auth_user_id;

-- View de cotacoes abertas para fornecedor
CREATE OR REPLACE VIEW vw_cotacoes_fornecedor AS
SELECT
    c.id,
    c.numero_cotacao,
    c.projeto_nome,
    c.titulo,
    c.descricao,
    c.data_limite,
    c.prazo_execucao_dias,
    c.status,
    c.permite_proposta_parcial,
    c.exige_visita_tecnica,
    fc.nome as categoria,
    cf.fornecedor_id,
    cf.visualizado,
    cf.participando,
    cp.id as proposta_id,
    cp.status as proposta_status,
    cp.valor_total as proposta_valor
FROM cotacoes c
JOIN fornecedor_categorias fc ON c.categoria_id = fc.id
JOIN cotacao_fornecedores cf ON cf.cotacao_id = c.id
LEFT JOIN cotacao_propostas cp ON cp.cotacao_id = c.id AND cp.fornecedor_id = cf.fornecedor_id
WHERE c.status IN ('aberta', 'em_andamento');

-- View completa de equipes de projeto
CREATE OR REPLACE VIEW vw_projeto_equipes_completa AS
SELECT
    pe.id,
    pe.projeto_id,
    p.nome AS projeto_nome,
    pe.tarefa_id,
    ct.titulo AS tarefa_titulo,
    pe.pessoa_id,
    pes.nome AS pessoa_nome,
    pes.tipo AS pessoa_tipo,
    pe.tipo_pessoa,
    pe.funcao,
    pe.is_responsavel,
    pe.horas_alocadas,
    pe.custo_hora,
    pe.data_inicio_alocacao,
    pe.data_fim_alocacao,
    pe.data_atribuicao,
    pe.created_at,
    pe.updated_at
FROM projeto_equipes pe
LEFT JOIN projetos p ON pe.projeto_id = p.id
LEFT JOIN cronograma_tarefas ct ON pe.tarefa_id = ct.id
LEFT JOIN pessoas pes ON pe.pessoa_id = pes.id;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE colaborador_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaborador_valores_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotacao_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotacao_propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedor_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_checklist_items ENABLE ROW LEVEL SECURITY;

-- Policy: Colaborador ve apenas seus projetos
DROP POLICY IF EXISTS colaborador_projetos_select ON colaborador_projetos;
CREATE POLICY colaborador_projetos_select ON colaborador_projetos
    FOR SELECT USING (
        colaborador_id IN (
            SELECT p.id FROM pessoas p
            JOIN usuarios u ON u.pessoa_id = p.id
            WHERE u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'DIRETORIA')
        )
    );

-- Policy: Colaborador ve apenas suas solicitacoes (ou admin ve todas)
DROP POLICY IF EXISTS solicitacoes_pagamento_select ON solicitacoes_pagamento;
CREATE POLICY solicitacoes_pagamento_select ON solicitacoes_pagamento
    FOR SELECT USING (
        solicitante_id IN (
            SELECT p.id FROM pessoas p
            JOIN usuarios u ON u.pessoa_id = p.id
            WHERE u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO', 'DIRETORIA')
        )
    );

-- Policy: Colaborador ve apenas seus valores a receber
DROP POLICY IF EXISTS valores_receber_select ON colaborador_valores_receber;
CREATE POLICY valores_receber_select ON colaborador_valores_receber
    FOR SELECT USING (
        colaborador_id IN (
            SELECT p.id FROM pessoas p
            JOIN usuarios u ON u.pessoa_id = p.id
            WHERE u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO', 'DIRETORIA')
        )
    );

-- Policy: Fornecedor ve apenas cotacoes onde foi convidado
DROP POLICY IF EXISTS cotacoes_fornecedor_select ON cotacoes;
CREATE POLICY cotacoes_fornecedor_select ON cotacoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cotacao_fornecedores cf
            JOIN pessoas p ON p.id = cf.fornecedor_id
            JOIN usuarios u ON u.pessoa_id = p.id
            WHERE cf.cotacao_id = cotacoes.id
            AND u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'COORDENADOR')
        )
    );

-- Policy: Fornecedor ve apenas suas propostas
DROP POLICY IF EXISTS propostas_fornecedor_select ON cotacao_propostas;
CREATE POLICY propostas_fornecedor_select ON cotacao_propostas
    FOR SELECT USING (
        fornecedor_id IN (
            SELECT p.id FROM pessoas p
            JOIN usuarios u ON u.pessoa_id = p.id
            WHERE u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'COORDENADOR', 'FINANCEIRO')
        )
    );

-- Policy: Fornecedor ve apenas seus servicos contratados
DROP POLICY IF EXISTS servicos_fornecedor_select ON fornecedor_servicos;
CREATE POLICY servicos_fornecedor_select ON fornecedor_servicos
    FOR SELECT USING (
        fornecedor_id IN (
            SELECT p.id FROM pessoas p
            JOIN usuarios u ON u.pessoa_id = p.id
            WHERE u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario NOT IN ('CLIENTE', 'FORNECEDOR', 'ESPECIFICADOR')
        )
    );

-- Policies para cronograma_tarefas
DROP POLICY IF EXISTS "Usuarios podem ver todas as tarefas" ON cronograma_tarefas;
CREATE POLICY "Usuarios podem ver todas as tarefas"
    ON cronograma_tarefas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuarios podem criar tarefas" ON cronograma_tarefas;
CREATE POLICY "Usuarios podem criar tarefas"
    ON cronograma_tarefas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios podem atualizar tarefas" ON cronograma_tarefas;
CREATE POLICY "Usuarios podem atualizar tarefas"
    ON cronograma_tarefas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios podem deletar tarefas" ON cronograma_tarefas;
CREATE POLICY "Usuarios podem deletar tarefas"
    ON cronograma_tarefas FOR DELETE TO authenticated USING (true);

-- Policies para projeto_equipes
DROP POLICY IF EXISTS "Usuarios podem ver equipes" ON projeto_equipes;
CREATE POLICY "Usuarios podem ver equipes"
    ON projeto_equipes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuarios podem criar membros de equipe" ON projeto_equipes;
CREATE POLICY "Usuarios podem criar membros de equipe"
    ON projeto_equipes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios podem atualizar membros de equipe" ON projeto_equipes;
CREATE POLICY "Usuarios podem atualizar membros de equipe"
    ON projeto_equipes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios podem deletar membros de equipe" ON projeto_equipes;
CREATE POLICY "Usuarios podem deletar membros de equipe"
    ON projeto_equipes FOR DELETE TO authenticated USING (true);

-- Policies para checklist_templates
DROP POLICY IF EXISTS "Templates visiveis para todos" ON checklist_templates;
CREATE POLICY "Templates visiveis para todos"
    ON checklist_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admins podem gerenciar templates" ON checklist_templates;
CREATE POLICY "Apenas admins podem gerenciar templates"
    ON checklist_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND role IN ('admin', 'gerente')
        )
    );

-- Policies para checklist_template_items
DROP POLICY IF EXISTS "Itens de templates visiveis para todos" ON checklist_template_items;
CREATE POLICY "Itens de templates visiveis para todos"
    ON checklist_template_items FOR SELECT USING (true);

-- Policies para cliente_checklists
DROP POLICY IF EXISTS "Usuarios podem ver checklists" ON cliente_checklists;
CREATE POLICY "Usuarios podem ver checklists"
    ON cliente_checklists FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios podem gerenciar checklists" ON cliente_checklists;
CREATE POLICY "Usuarios podem gerenciar checklists"
    ON cliente_checklists FOR ALL USING (true);

-- Policies para cliente_checklist_items
DROP POLICY IF EXISTS "Usuarios podem ver itens de checklists" ON cliente_checklist_items;
CREATE POLICY "Usuarios podem ver itens de checklists"
    ON cliente_checklist_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios podem gerenciar itens de checklists" ON cliente_checklist_items;
CREATE POLICY "Usuarios podem gerenciar itens de checklists"
    ON cliente_checklist_items FOR ALL USING (true);

-- ============================================================================
-- DADOS INICIAIS (SEED)
-- ============================================================================

-- Inserir perfis padrao de colaborador
INSERT INTO colaborador_perfis (codigo, nome, descricao, nivel_hierarquico) VALUES
('DIRETORIA', 'Diretoria / Administracao', 'Acesso total ao sistema, aprovacoes finais', 4),
('COORDENADOR', 'Coordenador de Projetos / Obras', 'Gestao de projetos e equipes, aprovacoes intermediarias', 3),
('ARQUITETO', 'Arquiteto / Projetista', 'Desenvolvimento de projetos, acompanhamento tecnico', 2),
('COMERCIAL', 'Comercial', 'Prospeccao, propostas, relacionamento com clientes', 2),
('FINANCEIRO', 'Financeiro', 'Gestao financeira, pagamentos, cobrancas', 2),
('APOIO', 'Apoio Operacional', 'Suporte administrativo e operacional', 1)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir categorias padrao de fornecedor
INSERT INTO fornecedor_categorias (codigo, nome, descricao, icone) VALUES
('ELETRICA', 'Eletrica', 'Instalacoes eletricas e iluminacao', 'Zap'),
('HIDRAULICA', 'Hidraulica', 'Instalacoes hidraulicas e sanitarias', 'Droplets'),
('ALVENARIA', 'Alvenaria / Pedreiro', 'Construcao civil, alvenaria', 'Brick'),
('GESSO', 'Gesso / Drywall', 'Forros e divisorias', 'Square'),
('PINTURA', 'Pintura', 'Pintura residencial e comercial', 'Paintbrush'),
('MARCENARIA', 'Marcenaria', 'Moveis sob medida', 'Armchair'),
('MARMORARIA', 'Marmoraria', 'Marmores e granitos', 'Mountain'),
('VIDRACARIA', 'Vidracaria', 'Vidros e espelhos', 'Frame'),
('ARCONDICIONADO', 'Ar Condicionado', 'Climatizacao', 'Wind'),
('SERRALHERIA', 'Serralheria', 'Estruturas metalicas', 'Hammer'),
('AUTOMACAO', 'Automacao', 'Automacao residencial', 'Cpu'),
('PAISAGISMO', 'Paisagismo', 'Jardins e areas externas', 'TreeDeciduous'),
('PISCINA', 'Piscina', 'Construcao e manutencao de piscinas', 'Waves'),
('OUTROS', 'Outros', 'Outras categorias', 'MoreHorizontal')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
