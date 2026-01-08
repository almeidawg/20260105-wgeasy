-- ============================================================
-- SEED: Populacao da tabela sistema_modulos + Funcoes RPC
-- Sistema WG Easy - Grupo WG Almeida
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PARTE 1: CRIAR FUNCOES RPC PARA PERMISSOES
-- ============================================================

-- Remover funcoes existentes (necessario quando o tipo de retorno muda)
DROP FUNCTION IF EXISTS verificar_permissao(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS listar_modulos_permitidos(UUID);

-- Funcao: Verificar permissao de um usuario para um modulo
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

  -- MASTER sempre tem permissao total
  IF v_tipo_usuario = 'MASTER' THEN
    RETURN true;
  END IF;

  -- Buscar ID do modulo
  SELECT id INTO v_modulo_id
  FROM sistema_modulos
  WHERE codigo = p_codigo_modulo AND ativo = true
  LIMIT 1;

  IF v_modulo_id IS NULL THEN
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

-- Funcao: Listar modulos permitidos para um usuario
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

-- Conceder permissao para executar as funcoes
GRANT EXECUTE ON FUNCTION verificar_permissao(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION listar_modulos_permitidos(UUID) TO authenticated;

-- ============================================================
-- PARTE 2: POPULAR TABELA DE MODULOS
-- ============================================================

-- Limpar tabela existente (opcional - descomente se quiser resetar)
-- TRUNCATE TABLE permissoes_tipo_usuario CASCADE;
-- TRUNCATE TABLE sistema_modulos CASCADE;

-- ============================================================
-- INSERIR MODULOS DO SISTEMA
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

ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  secao = EXCLUDED.secao,
  path = EXCLUDED.path,
  icone = EXCLUDED.icone,
  ordem = EXCLUDED.ordem,
  ativo = EXCLUDED.ativo;

-- ============================================================
-- CRIAR PERMISSOES PADRAO PARA CADA TIPO DE USUARIO
-- ============================================================

-- Funcao auxiliar para criar permissoes em massa
DO $$
DECLARE
  modulo RECORD;
  tipos_usuario TEXT[] := ARRAY['MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO', 'COLABORADOR', 'CLIENTE', 'ESPECIFICADOR', 'FORNECEDOR', 'JURIDICO', 'FINANCEIRO'];
  tipo TEXT;
BEGIN
  -- Para cada modulo
  FOR modulo IN SELECT id, codigo FROM sistema_modulos WHERE ativo = true LOOP
    -- Para cada tipo de usuario
    FOREACH tipo IN ARRAY tipos_usuario LOOP
      -- Inserir permissao padrao (visualizar = true para todos, exceto modulos restritos)
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
        -- MASTER sempre tem tudo
        CASE WHEN tipo = 'MASTER' THEN true
        -- Modulos restritos por tipo
        WHEN modulo.codigo IN ('meu-financeiro', 'dashboard-executivo', 'empresas', 'planta-sistema', 'saude-sistema') AND tipo != 'MASTER' THEN false
        -- Modulos financeiros apenas para ADMIN, FINANCEIRO e MASTER
        WHEN modulo.codigo LIKE 'financeiro%' AND tipo NOT IN ('MASTER', 'ADMIN', 'FINANCEIRO') THEN false
        -- Modulos juridicos apenas para ADMIN, JURIDICO e MASTER
        WHEN modulo.codigo LIKE 'juridico%' AND tipo NOT IN ('MASTER', 'ADMIN', 'JURIDICO') THEN false
        -- Usuarios apenas MASTER e ADMIN
        WHEN modulo.codigo = 'usuarios' AND tipo NOT IN ('MASTER', 'ADMIN') THEN false
        -- Padrao: visualizar permitido
        ELSE true END,
        -- pode_criar
        CASE WHEN tipo = 'MASTER' THEN true
        WHEN tipo = 'ADMIN' THEN true
        WHEN tipo IN ('COMERCIAL', 'ATENDIMENTO') AND modulo.codigo IN ('clientes', 'oportunidades', 'propostas', 'evf', 'analise-projeto') THEN true
        ELSE false END,
        -- pode_editar
        CASE WHEN tipo = 'MASTER' THEN true
        WHEN tipo = 'ADMIN' THEN true
        WHEN tipo IN ('COMERCIAL', 'ATENDIMENTO') AND modulo.codigo IN ('clientes', 'oportunidades', 'propostas', 'evf', 'analise-projeto') THEN true
        ELSE false END,
        -- pode_excluir
        CASE WHEN tipo = 'MASTER' THEN true
        WHEN tipo = 'ADMIN' THEN true
        ELSE false END,
        -- pode_exportar
        CASE WHEN tipo IN ('MASTER', 'ADMIN') THEN true
        ELSE false END,
        -- pode_importar
        CASE WHEN tipo IN ('MASTER', 'ADMIN') THEN true
        ELSE false END
      )
      ON CONFLICT (tipo_usuario, modulo_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- VERIFICAR RESULTADOS
-- ============================================================

-- Contar modulos inseridos
SELECT 'Modulos inseridos:' as info, COUNT(*) as total FROM sistema_modulos WHERE ativo = true;

-- Contar permissoes criadas
SELECT 'Permissoes criadas:' as info, COUNT(*) as total FROM permissoes_tipo_usuario;

-- Listar modulos por secao
SELECT secao, COUNT(*) as qtd_modulos
FROM sistema_modulos
WHERE ativo = true
GROUP BY secao
ORDER BY MIN(ordem);

-- Listar permissoes por tipo de usuario
SELECT tipo_usuario,
       COUNT(*) as total_modulos,
       SUM(CASE WHEN pode_visualizar THEN 1 ELSE 0 END) as pode_ver,
       SUM(CASE WHEN pode_criar THEN 1 ELSE 0 END) as pode_criar,
       SUM(CASE WHEN pode_editar THEN 1 ELSE 0 END) as pode_editar,
       SUM(CASE WHEN pode_excluir THEN 1 ELSE 0 END) as pode_excluir
FROM permissoes_tipo_usuario
GROUP BY tipo_usuario
ORDER BY tipo_usuario;
