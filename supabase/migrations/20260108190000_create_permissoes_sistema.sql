-- ============================================================
-- MIGRATION: Sistema de Permissões por Módulo
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-08
-- Descrição: Cria tabelas e funções RPC para controle de permissões
-- ============================================================

-- ============================================================
-- TABELA: sistema_modulos
-- ============================================================
CREATE TABLE IF NOT EXISTS sistema_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  secao TEXT NOT NULL,
  path TEXT,
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar constraint UNIQUE se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sistema_modulos_codigo_key'
    AND conrelid = 'sistema_modulos'::regclass
  ) THEN
    ALTER TABLE sistema_modulos ADD CONSTRAINT sistema_modulos_codigo_key UNIQUE (codigo);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Se já existe com outro nome, ignora
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_sistema_modulos_codigo ON sistema_modulos(codigo);
CREATE INDEX IF NOT EXISTS idx_sistema_modulos_secao ON sistema_modulos(secao);
CREATE INDEX IF NOT EXISTS idx_sistema_modulos_ativo ON sistema_modulos(ativo);
CREATE INDEX IF NOT EXISTS idx_sistema_modulos_ordem ON sistema_modulos(ordem);

-- ============================================================
-- TABELA: permissoes_tipo_usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS permissoes_tipo_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_usuario TEXT NOT NULL,
  modulo_id UUID NOT NULL REFERENCES sistema_modulos(id) ON DELETE CASCADE,
  pode_visualizar BOOLEAN DEFAULT false,
  pode_criar BOOLEAN DEFAULT false,
  pode_editar BOOLEAN DEFAULT false,
  pode_excluir BOOLEAN DEFAULT false,
  pode_exportar BOOLEAN DEFAULT false,
  pode_importar BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar constraint UNIQUE se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'permissoes_tipo_usuario_tipo_modulo_key'
    AND conrelid = 'permissoes_tipo_usuario'::regclass
  ) THEN
    ALTER TABLE permissoes_tipo_usuario ADD CONSTRAINT permissoes_tipo_usuario_tipo_modulo_key UNIQUE (tipo_usuario, modulo_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Se já existe com outro nome, ignora
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_permissoes_tipo_usuario_tipo ON permissoes_tipo_usuario(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_permissoes_tipo_usuario_modulo ON permissoes_tipo_usuario(modulo_id);

-- ============================================================
-- HABILITAR RLS
-- ============================================================
ALTER TABLE sistema_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_tipo_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas para sistema_modulos (leitura para todos autenticados)
DROP POLICY IF EXISTS "Usuarios autenticados podem ver modulos" ON sistema_modulos;
CREATE POLICY "Usuarios autenticados podem ver modulos"
  ON sistema_modulos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Políticas para permissoes_tipo_usuario (leitura para todos autenticados)
DROP POLICY IF EXISTS "Usuarios autenticados podem ver permissoes" ON permissoes_tipo_usuario;
CREATE POLICY "Usuarios autenticados podem ver permissoes"
  ON permissoes_tipo_usuario FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins podem gerenciar permissões
DROP POLICY IF EXISTS "Admins podem gerenciar permissoes" ON permissoes_tipo_usuario;
CREATE POLICY "Admins podem gerenciar permissoes"
  ON permissoes_tipo_usuario FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
    )
  );

-- ============================================================
-- FUNÇÃO: verificar_permissao
-- ============================================================
DROP FUNCTION IF EXISTS verificar_permissao(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION verificar_permissao(
  p_auth_user_id UUID,
  p_codigo_modulo TEXT,
  p_tipo_permissao TEXT DEFAULT 'pode_visualizar'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tipo_usuario TEXT;
  v_modulo_id UUID;
  v_tem_permissao BOOLEAN := false;
BEGIN
  -- Buscar tipo do usuario
  SELECT tipo_usuario INTO v_tipo_usuario
  FROM usuarios
  WHERE auth_user_id = p_auth_user_id
  LIMIT 1;

  -- Se não encontrou usuário, tentar pela tabela pessoas
  IF v_tipo_usuario IS NULL THEN
    SELECT tipo INTO v_tipo_usuario
    FROM pessoas
    WHERE email = (SELECT email FROM auth.users WHERE id = p_auth_user_id)
    LIMIT 1;
  END IF;

  -- MASTER sempre tem permissao total
  IF v_tipo_usuario = 'MASTER' THEN
    RETURN true;
  END IF;

  -- Se ainda não tem tipo, sem permissão
  IF v_tipo_usuario IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar ID do modulo
  SELECT id INTO v_modulo_id
  FROM sistema_modulos
  WHERE codigo = p_codigo_modulo AND ativo = true
  LIMIT 1;

  IF v_modulo_id IS NULL THEN
    -- Módulo não existe, retorna false
    RETURN false;
  END IF;

  -- Verificar permissao na tabela
  EXECUTE format(
    'SELECT %I FROM permissoes_tipo_usuario WHERE tipo_usuario = $1 AND modulo_id = $2',
    p_tipo_permissao
  ) INTO v_tem_permissao
  USING v_tipo_usuario, v_modulo_id;

  RETURN COALESCE(v_tem_permissao, false);
END;
$$;

-- ============================================================
-- FUNÇÃO: listar_modulos_permitidos
-- ============================================================
DROP FUNCTION IF EXISTS listar_modulos_permitidos(UUID);

CREATE OR REPLACE FUNCTION listar_modulos_permitidos(p_auth_user_id UUID)
RETURNS TABLE (
  codigo TEXT,
  nome TEXT,
  secao TEXT,
  path TEXT,
  pode_visualizar BOOLEAN,
  pode_criar BOOLEAN,
  pode_editar BOOLEAN,
  pode_excluir BOOLEAN,
  pode_exportar BOOLEAN,
  pode_importar BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tipo_usuario TEXT;
BEGIN
  -- Buscar tipo do usuario
  SELECT u.tipo_usuario INTO v_tipo_usuario
  FROM usuarios u
  WHERE u.auth_user_id = p_auth_user_id
  LIMIT 1;

  -- Se não encontrou, tentar pela tabela pessoas
  IF v_tipo_usuario IS NULL THEN
    SELECT p.tipo INTO v_tipo_usuario
    FROM pessoas p
    WHERE p.email = (SELECT email FROM auth.users WHERE id = p_auth_user_id)
    LIMIT 1;
  END IF;

  -- MASTER ve tudo
  IF v_tipo_usuario = 'MASTER' THEN
    RETURN QUERY
    SELECT
      sm.codigo,
      sm.nome,
      sm.secao,
      sm.path,
      true as pode_visualizar,
      true as pode_criar,
      true as pode_editar,
      true as pode_excluir,
      true as pode_exportar,
      true as pode_importar
    FROM sistema_modulos sm
    WHERE sm.ativo = true
    ORDER BY sm.ordem;
    RETURN;
  END IF;

  -- Outros usuarios: filtrar por permissoes
  RETURN QUERY
  SELECT
    sm.codigo,
    sm.nome,
    sm.secao,
    sm.path,
    COALESCE(ptu.pode_visualizar, false) as pode_visualizar,
    COALESCE(ptu.pode_criar, false) as pode_criar,
    COALESCE(ptu.pode_editar, false) as pode_editar,
    COALESCE(ptu.pode_excluir, false) as pode_excluir,
    COALESCE(ptu.pode_exportar, false) as pode_exportar,
    COALESCE(ptu.pode_importar, false) as pode_importar
  FROM sistema_modulos sm
  LEFT JOIN permissoes_tipo_usuario ptu
    ON ptu.modulo_id = sm.id
    AND ptu.tipo_usuario = v_tipo_usuario
  WHERE sm.ativo = true
    AND COALESCE(ptu.pode_visualizar, false) = true
  ORDER BY sm.ordem;
END;
$$;

-- ============================================================
-- CONCEDER PERMISSÕES PARA EXECUTAR AS FUNÇÕES
-- ============================================================
GRANT EXECUTE ON FUNCTION verificar_permissao(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION listar_modulos_permitidos(UUID) TO authenticated;

-- ============================================================
-- INSERIR MÓDULOS DO SISTEMA
-- ============================================================
INSERT INTO sistema_modulos (codigo, nome, descricao, secao, path, icone, ordem, ativo)
VALUES
  -- DASHBOARD
  ('dashboard', 'Dashboard', 'Painel principal do sistema', 'Dashboard', '/', 'LayoutDashboard', 1, true),
  ('meu-financeiro', 'Meu Financeiro', 'Painel financeiro pessoal', 'Dashboard', '/meu-financeiro', 'Wallet', 2, true),
  ('dashboard-executivo', 'Visao Executiva', 'Dashboard estrategico CEO', 'Dashboard', '/dashboard/executivo', 'BarChart3', 3, true),

  -- PESSOAS
  ('clientes', 'Clientes', 'Gestao de clientes', 'Pessoas', '/pessoas/clientes', 'Users', 10, true),
  ('colaboradores', 'Colaboradores', 'Gestao de colaboradores', 'Pessoas', '/pessoas/colaboradores', 'Users', 11, true),
  ('especificadores', 'Especificadores', 'Gestao de especificadores', 'Pessoas', '/pessoas/especificadores', 'Users', 12, true),
  ('fornecedores', 'Fornecedores', 'Gestao de fornecedores', 'Pessoas', '/pessoas/fornecedores', 'Truck', 13, true),

  -- OPORTUNIDADES
  ('oportunidades', 'Oportunidades', 'Gestao de oportunidades comerciais', 'Oportunidades', '/oportunidades', 'Target', 20, true),

  -- COMERCIAL
  ('evf', 'Estudo (EVF)', 'Estudo de viabilidade financeira', 'Comercial', '/evf', 'FileText', 30, true),
  ('analise-projeto', 'Analise de Projeto', 'Analise de projetos', 'Comercial', '/analise-projeto', 'FileSearch', 31, true),
  ('propostas', 'Propostas', 'Gestao de propostas comerciais', 'Comercial', '/propostas', 'FileText', 32, true),
  ('contratos', 'Contratos', 'Gestao de contratos', 'Comercial', '/contratos', 'FileText', 33, true),

  -- NUCLEOS
  ('nucleo-arquitetura', 'Arquitetura', 'Kanban nucleo arquitetura', 'Nucleos', '/oportunidades/kanban/arquitetura', 'Palette', 40, true),
  ('nucleo-engenharia', 'Engenharia', 'Kanban nucleo engenharia', 'Nucleos', '/oportunidades/kanban/engenharia', 'Wrench', 41, true),
  ('nucleo-marcenaria', 'Marcenaria', 'Kanban nucleo marcenaria', 'Nucleos', '/oportunidades/kanban/marcenaria', 'Hammer', 42, true),

  -- PLANEJAMENTO
  ('planejamento', 'Planejamento', 'Dashboard de planejamento', 'Planejamento', '/planejamento', 'ClipboardList', 50, true),
  ('planejamento-novo', 'Novo Pedido', 'Criar novo pedido', 'Planejamento', '/planejamento/novo', 'Plus', 51, true),
  ('composicoes', 'Composicoes', 'Gestao de composicoes', 'Planejamento', '/planejamento/composicoes', 'Puzzle', 52, true),
  ('aprovacoes', 'Aprovacoes', 'Aprovacoes pendentes', 'Planejamento', '/planejamento/aprovacoes', 'CheckSquare', 53, true),
  ('orcamentos', 'Orcamentos', 'Gestao de orcamentos', 'Planejamento', '/planejamento/orcamentos', 'FileText', 54, true),
  ('compras', 'Compras', 'Gestao de compras', 'Planejamento', '/compras', 'ShoppingCart', 55, true),

  -- SERVICOS
  ('servicos', 'Servicos', 'Gestao de servicos', 'Servicos', '/servicos', 'Truck', 60, true),

  -- CRONOGRAMA
  ('cronograma', 'Cronograma', 'Dashboard de cronograma', 'Cronograma', '/cronograma', 'Calendar', 70, true),
  ('cronograma-projetos', 'Projetos', 'Projetos do cronograma', 'Cronograma', '/cronograma/projects', 'FolderKanban', 71, true),

  -- FINANCEIRO
  ('financeiro', 'Financeiro', 'Dashboard financeiro', 'Financeiro', '/financeiro', 'Coins', 80, true),
  ('financeiro-obras', 'Projetos Financeiro', 'Projetos financeiros', 'Financeiro', '/financeiro/obras', 'Building2', 81, true),
  ('lancamentos', 'Lancamentos', 'Lancamentos financeiros', 'Financeiro', '/financeiro/lancamentos', 'Receipt', 82, true),
  ('solicitacoes', 'SDP - Solicitacoes', 'Solicitacoes de pagamento', 'Financeiro', '/financeiro/solicitacoes', 'FileText', 83, true),
  ('reembolsos', 'Reembolsos', 'Gestao de reembolsos', 'Financeiro', '/financeiro/reembolsos', 'RefreshCw', 84, true),
  ('cobrancas', 'Cobrancas', 'Gestao de cobrancas', 'Financeiro', '/financeiro/cobrancas', 'DollarSign', 85, true),
  ('relatorios-financeiro', 'Relatorios Financeiro', 'Relatorios financeiros', 'Financeiro', '/financeiro/relatorios', 'BarChart3', 86, true),
  ('comissionamento', 'Comissoes', 'Gestao de comissoes', 'Financeiro', '/financeiro/comissionamento', 'Percent', 87, true),

  -- JURIDICO
  ('juridico', 'Juridico', 'Dashboard juridico', 'Juridico', '/juridico', 'Scale', 90, true),
  ('assistencia-juridica', 'Assistencia Juridica', 'Assistencia juridica', 'Juridico', '/juridico/assistencia', 'Gavel', 91, true),
  ('financeiro-juridico', 'Financeiro Juridico', 'Financeiro juridico', 'Juridico', '/juridico/financeiro', 'Coins', 92, true),
  ('empresas-grupo', 'Empresas do Grupo WG', 'Gestao de empresas', 'Juridico', '/juridico/empresas', 'Building2', 93, true),
  ('modelos-contrato', 'Modelos de Contrato', 'Modelos de contrato', 'Juridico', '/juridico/modelos', 'FileText', 94, true),

  -- AREA WGXPERIENCE
  ('portal-cliente', 'Portal do Cliente', 'Portal do cliente', 'Area WGXperience', '/portal-cliente', 'Home', 100, true),
  ('area-cliente-cadastro', 'Cadastro Area Cliente', 'Cadastro de clientes area cliente', 'Area WGXperience', '/sistema/area-cliente/clientes', 'UserPlus', 101, true),
  ('drive-compartilhado', 'Drive Compartilhado', 'Drive compartilhado', 'Area WGXperience', '/sistema/area-cliente/drive', 'HardDrive', 102, true),

  -- POS VENDAS
  ('assistencia', 'Assistencia', 'Assistencia tecnica', 'Pos Vendas', '/assistencia', 'Wrench', 110, true),
  ('termo-aceite', 'Termo de Aceite', 'Termos de aceite', 'Pos Vendas', '/termo-aceite', 'FileCheck', 111, true),
  ('garantia', 'Garantia', 'Gestao de garantias', 'Pos Vendas', '/garantia', 'Shield', 112, true),

  -- ONBOARDING
  ('onboarding', 'Onboarding', 'Onboarding de clientes', 'Onboarding', '/onboarding', 'Rocket', 120, true),

  -- WG STORE
  ('wg-store', 'Loja Virtual', 'WG Store', 'WG Store', '/wg-store', 'ShoppingCart', 130, true),
  ('memorial-acabamentos', 'Memorial de Acabamentos', 'Memorial de acabamentos', 'WG Store', '/memorial-acabamentos', 'Palette', 131, true),

  -- DEPOSITO WG
  ('deposito', 'Deposito WG', 'Deposito WG', 'Deposito WG', '/deposito', 'Package', 140, true),

  -- SISTEMA
  ('cadastros-pendentes', 'Cadastros Pendentes', 'Cadastros pendentes', 'Sistema', '/sistema/cadastros-pendentes', 'Clock', 150, true),
  ('central-links', 'Central de Links', 'Central de links', 'Sistema', '/sistema/central-links', 'Link', 151, true),
  ('importar-exportar', 'Central Import/Export', 'Importar e exportar dados', 'Sistema', '/sistema/importar-exportar', 'Upload', 152, true),
  ('empresas', 'Empresas do Grupo WG', 'Gestao de empresas', 'Sistema', '/empresas', 'Building2', 153, true),
  ('planta-sistema', 'Planta do Sistema', 'Configuracao de permissoes', 'Sistema', '/sistema/planta', 'Settings', 154, true),
  ('precificacao', 'Precificacao', 'Configuracao de precos', 'Sistema', '/sistema/precificacao', 'DollarSign', 155, true),
  ('pricelist', 'Price List', 'Lista de precos', 'Sistema', '/pricelist', 'List', 156, true),
  ('saude-sistema', 'Saude do Sistema', 'Monitoramento do sistema', 'Sistema', '/sistema/saude', 'Activity', 157, true),
  ('checklists', 'Templates de Checklists', 'Templates de checklists', 'Sistema', '/sistema/checklists', 'CheckSquare', 158, true),
  ('usuarios', 'Usuarios', 'Gestao de usuarios', 'Sistema', '/usuarios', 'Users', 159, true)

ON CONFLICT ON CONSTRAINT sistema_modulos_codigo_key DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  secao = EXCLUDED.secao,
  path = EXCLUDED.path,
  icone = EXCLUDED.icone,
  ordem = EXCLUDED.ordem,
  ativo = EXCLUDED.ativo;

-- ============================================================
-- CRIAR PERMISSÕES PADRÃO PARA CADA TIPO DE USUÁRIO
-- ============================================================
DO $$
DECLARE
  modulo RECORD;
  tipos_usuario TEXT[] := ARRAY['MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO', 'COLABORADOR', 'CLIENTE', 'ESPECIFICADOR', 'FORNECEDOR', 'JURIDICO', 'FINANCEIRO', 'GERENTE'];
  tipo TEXT;
BEGIN
  -- Para cada modulo
  FOR modulo IN SELECT id, codigo FROM sistema_modulos WHERE ativo = true LOOP
    -- Para cada tipo de usuario
    FOREACH tipo IN ARRAY tipos_usuario LOOP
      -- Inserir permissao padrao
      INSERT INTO permissoes_tipo_usuario (
        tipo_usuario,
        modulo_id,
        pode_visualizar,
        pode_criar,
        pode_editar,
        pode_excluir,
        pode_exportar,
        pode_importar
      )
      VALUES (
        tipo,
        modulo.id,
        -- pode_visualizar
        CASE
          WHEN tipo IN ('MASTER', 'ADMIN', 'GERENTE') THEN true
          WHEN modulo.codigo IN ('meu-financeiro', 'dashboard-executivo', 'empresas', 'planta-sistema', 'saude-sistema', 'usuarios') AND tipo NOT IN ('MASTER', 'ADMIN') THEN false
          WHEN modulo.codigo LIKE 'financeiro%' AND tipo NOT IN ('MASTER', 'ADMIN', 'FINANCEIRO', 'GERENTE') THEN false
          WHEN modulo.codigo LIKE 'juridico%' AND tipo NOT IN ('MASTER', 'ADMIN', 'JURIDICO', 'GERENTE') THEN false
          ELSE true
        END,
        -- pode_criar
        CASE
          WHEN tipo IN ('MASTER', 'ADMIN', 'GERENTE') THEN true
          WHEN tipo IN ('COMERCIAL', 'ATENDIMENTO') AND modulo.codigo IN ('clientes', 'oportunidades', 'propostas', 'evf', 'analise-projeto') THEN true
          WHEN tipo = 'COLABORADOR' AND modulo.codigo IN ('planejamento', 'planejamento-novo') THEN true
          WHEN tipo = 'JURIDICO' AND modulo.codigo LIKE 'juridico%' THEN true
          WHEN tipo = 'FINANCEIRO' AND modulo.codigo LIKE 'financeiro%' THEN true
          ELSE false
        END,
        -- pode_editar
        CASE
          WHEN tipo IN ('MASTER', 'ADMIN', 'GERENTE') THEN true
          WHEN tipo IN ('COMERCIAL', 'ATENDIMENTO') AND modulo.codigo IN ('clientes', 'oportunidades', 'propostas', 'evf', 'analise-projeto') THEN true
          WHEN tipo = 'JURIDICO' AND modulo.codigo LIKE 'juridico%' THEN true
          WHEN tipo = 'FINANCEIRO' AND modulo.codigo LIKE 'financeiro%' THEN true
          ELSE false
        END,
        -- pode_excluir
        CASE
          WHEN tipo IN ('MASTER', 'ADMIN') THEN true
          ELSE false
        END,
        -- pode_exportar
        CASE
          WHEN tipo IN ('MASTER', 'ADMIN', 'GERENTE') THEN true
          ELSE false
        END,
        -- pode_importar
        CASE
          WHEN tipo IN ('MASTER', 'ADMIN') THEN true
          ELSE false
        END
      )
      ON CONFLICT ON CONSTRAINT permissoes_tipo_usuario_tipo_modulo_key DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- LOG
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260108190000_create_permissoes_sistema executada com sucesso!';
  RAISE NOTICE 'Tabelas criadas: sistema_modulos, permissoes_tipo_usuario';
  RAISE NOTICE 'Funcoes criadas: verificar_permissao, listar_modulos_permitidos';
END $$;
