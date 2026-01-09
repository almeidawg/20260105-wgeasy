-- ============================================================
-- MIGRATION: Corrigir views e funções faltantes
-- Data: 2026-01-09
-- Descrição: Cria views e funções RPC que estão faltando no banco
-- ============================================================

-- ============================================================
-- 1. VIEW: vw_financeiro_juridico_detalhado
-- ============================================================

CREATE OR REPLACE VIEW vw_financeiro_juridico_detalhado AS
SELECT
  fj.id,
  fj.assistencia_id,
  fj.contrato_id,
  fj.tipo,
  fj.natureza,
  fj.descricao,
  fj.observacoes,
  fj.valor,
  fj.valor_pago,
  fj.data_competencia,
  fj.data_vencimento,
  fj.data_pagamento,
  fj.status,
  fj.parcela_atual,
  fj.total_parcelas,
  fj.pessoa_id,
  fj.empresa_id,
  fj.sincronizado_financeiro,
  fj.financeiro_lancamento_id,
  fj.criado_por,
  fj.atualizado_por,
  fj.created_at,
  fj.updated_at,
  -- Dados da pessoa
  p.nome AS pessoa_nome,
  p.tipo AS pessoa_tipo,
  p.cpf AS pessoa_cpf,
  p.cnpj AS pessoa_cnpj,
  -- Dados da empresa (se aplicável - pessoas do tipo empresa)
  pe.nome AS empresa_nome,
  -- Dados da assistência jurídica
  aj.titulo AS assistencia_titulo,
  aj.numero_processo,
  -- Dados do contrato
  c.numero AS contrato_numero,
  -- Cálculo de dias de atraso
  CASE
    WHEN fj.status IN ('PENDENTE', 'ATRASADO') AND fj.data_vencimento < CURRENT_DATE
    THEN (CURRENT_DATE - fj.data_vencimento::date)::integer
    ELSE 0
  END AS dias_atraso
FROM financeiro_juridico fj
LEFT JOIN pessoas p ON fj.pessoa_id = p.id
LEFT JOIN pessoas pe ON fj.empresa_id = pe.id
LEFT JOIN assistencia_juridica aj ON fj.assistencia_id = aj.id
LEFT JOIN contratos c ON fj.contrato_id = c.id;

-- Comentário na view
COMMENT ON VIEW vw_financeiro_juridico_detalhado IS 'View detalhada do financeiro jurídico com dados relacionados';

-- ============================================================
-- 2. FUNÇÃO RPC: listar_especificadores_master
-- ============================================================

-- Dropar função existente se houver conflito de tipo
DROP FUNCTION IF EXISTS listar_especificadores_master(UUID);

CREATE OR REPLACE FUNCTION listar_especificadores_master(
  p_nucleo_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  email TEXT,
  tipo TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nome::TEXT,
    p.email::TEXT,
    p.tipo::TEXT
  FROM pessoas p
  WHERE p.is_master = true
    AND p.ativo = true
    AND (p_nucleo_id IS NULL OR p.nucleo_id = p_nucleo_id)
  ORDER BY p.nome;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION listar_especificadores_master(UUID) IS 'Lista especificadores/colaboradores Master para dropdown de indicador';

-- ============================================================
-- 3. VIEW: vw_usuarios_com_pessoa
-- View que expõe usuarios com dados da pessoa vinculada
-- Isso resolve o problema de JOIN em assistencia_ordens
-- ============================================================

CREATE OR REPLACE VIEW vw_usuarios_com_pessoa AS
SELECT
  u.id,
  u.auth_user_id,
  u.pessoa_id,
  u.tipo,
  u.ativo,
  u.created_at,
  u.updated_at,
  -- Dados da pessoa vinculada
  p.nome,
  p.email,
  p.telefone,
  p.cpf,
  p.cnpj,
  p.endereco,
  p.cidade,
  p.estado,
  p.cep
FROM usuarios u
LEFT JOIN pessoas p ON u.pessoa_id = p.id;

-- Comentário na view
COMMENT ON VIEW vw_usuarios_com_pessoa IS 'View de usuarios com dados da pessoa vinculada para facilitar JOINs';

-- ============================================================
-- 4. Ajustar função aprovar_cadastro para evitar ambiguidade
-- ============================================================

-- Dropar versões antigas da função que podem estar causando conflito
DROP FUNCTION IF EXISTS aprovar_cadastro(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS aprovar_cadastro(UUID, TEXT, UUID, BOOLEAN, UUID, UUID);

-- Recriar função com parâmetros completos
CREATE OR REPLACE FUNCTION aprovar_cadastro(
  p_cadastro_id UUID,
  p_tipo_usuario TEXT,
  p_aprovado_por UUID DEFAULT NULL,
  p_is_master BOOLEAN DEFAULT NULL,
  p_indicado_por_id UUID DEFAULT NULL,
  p_categoria_comissao_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cadastro RECORD;
  v_pessoa_id UUID;
  v_usuario_id UUID;
  v_email TEXT;
  v_senha_temp TEXT;
  v_auth_user_id UUID;
  v_is_master BOOLEAN;
  v_categoria_id UUID;
BEGIN
  -- Buscar cadastro
  SELECT * INTO v_cadastro
  FROM cadastros_pendentes
  WHERE id = p_cadastro_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cadastro não encontrado');
  END IF;

  IF v_cadastro.status != 'pendente_aprovacao' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cadastro não está pendente de aprovação');
  END IF;

  -- Determinar se é Master
  v_is_master := COALESCE(p_is_master, false);

  -- Determinar categoria de comissão
  v_categoria_id := p_categoria_comissao_id;

  -- Criar pessoa
  INSERT INTO pessoas (
    nome, email, telefone, cpf, cnpj,
    endereco, numero, complemento, cidade, estado, cep,
    tipo, is_master, indicado_por_id, categoria_comissao_id,
    nucleo_id, ativo
  )
  VALUES (
    v_cadastro.nome,
    v_cadastro.email,
    v_cadastro.telefone,
    CASE WHEN length(COALESCE(v_cadastro.cpf_cnpj, '')) <= 14 THEN v_cadastro.cpf_cnpj ELSE NULL END,
    CASE WHEN length(COALESCE(v_cadastro.cpf_cnpj, '')) > 14 THEN v_cadastro.cpf_cnpj ELSE NULL END,
    v_cadastro.endereco,
    v_cadastro.numero,
    v_cadastro.complemento,
    v_cadastro.cidade,
    v_cadastro.estado,
    v_cadastro.cep,
    v_cadastro.tipo_solicitado,
    v_is_master,
    p_indicado_por_id,
    v_categoria_id,
    v_cadastro.nucleo_id,
    true
  )
  RETURNING id INTO v_pessoa_id;

  v_email := v_cadastro.email;
  v_senha_temp := 'WGEasy@' || substr(md5(random()::text), 1, 6);

  -- Atualizar cadastro como aprovado
  UPDATE cadastros_pendentes
  SET
    status = 'aprovado',
    aprovado_por = p_aprovado_por,
    aprovado_em = NOW(),
    tipo_usuario_aprovado = p_tipo_usuario,
    pessoa_id = v_pessoa_id,
    atualizado_em = NOW()
  WHERE id = p_cadastro_id;

  RETURN jsonb_build_object(
    'success', true,
    'pessoa_id', v_pessoa_id,
    'email', v_email,
    'senha_temporaria', v_senha_temp,
    'is_master', v_is_master,
    'categoria_comissao_id', v_categoria_id,
    'message', 'Cadastro aprovado com sucesso!'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION aprovar_cadastro(UUID, TEXT, UUID, BOOLEAN, UUID, UUID) IS 'Aprova um cadastro pendente e cria pessoa/usuario';

-- ============================================================
-- 5. Ajustar função verificar_permissao para evitar ambiguidade
-- ============================================================

-- Dropar versões antigas
DROP FUNCTION IF EXISTS verificar_permissao_modulo(UUID, TEXT, TEXT);

-- Recriar com nome único
CREATE OR REPLACE FUNCTION verificar_permissao_modulo(
  p_usuario_id UUID,
  p_codigo_modulo TEXT,
  p_tipo_permissao TEXT DEFAULT 'visualizar'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tem_permissao BOOLEAN;
BEGIN
  -- Buscar permissão do usuário para o módulo
  SELECT EXISTS (
    SELECT 1
    FROM usuario_permissoes up
    JOIN modulos m ON up.modulo_id = m.id
    WHERE up.usuario_id = p_usuario_id
      AND m.codigo = p_codigo_modulo
      AND (
        (p_tipo_permissao = 'visualizar' AND up.pode_visualizar = true) OR
        (p_tipo_permissao = 'criar' AND up.pode_criar = true) OR
        (p_tipo_permissao = 'editar' AND up.pode_editar = true) OR
        (p_tipo_permissao = 'excluir' AND up.pode_excluir = true) OR
        (p_tipo_permissao = 'administrar' AND up.pode_administrar = true)
      )
  ) INTO v_tem_permissao;

  RETURN COALESCE(v_tem_permissao, false);
END;
$$;

-- Comentário
COMMENT ON FUNCTION verificar_permissao_modulo(UUID, TEXT, TEXT) IS 'Verifica se usuário tem permissão específica em um módulo';

-- ============================================================
-- 6. Verificar e adicionar coluna is_master em pessoas se não existir
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'pessoas'
    AND column_name = 'is_master'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN is_master BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'pessoas'
    AND column_name = 'indicado_por_id'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN indicado_por_id UUID REFERENCES pessoas(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'pessoas'
    AND column_name = 'categoria_comissao_id'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN categoria_comissao_id UUID;
  END IF;
END $$;

-- ============================================================
-- 7. Grant permissões
-- ============================================================

GRANT SELECT ON vw_financeiro_juridico_detalhado TO authenticated;
GRANT SELECT ON vw_financeiro_juridico_detalhado TO anon;
GRANT SELECT ON vw_usuarios_com_pessoa TO authenticated;
GRANT EXECUTE ON FUNCTION listar_especificadores_master(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION aprovar_cadastro(UUID, TEXT, UUID, BOOLEAN, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_permissao_modulo(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================
-- 8. Verificar e corrigir FKs de solicitacoes_servico
-- ============================================================

-- Garantir que as FKs existam para solicitacoes_servico
DO $$
BEGIN
  -- FK para prestador_id -> pessoas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'solicitacoes_servico_prestador_id_fkey'
  ) THEN
    ALTER TABLE solicitacoes_servico
      ADD CONSTRAINT solicitacoes_servico_prestador_id_fkey
      FOREIGN KEY (prestador_id) REFERENCES pessoas(id) ON DELETE SET NULL;
  END IF;

  -- FK para cliente_id -> pessoas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'solicitacoes_servico_cliente_id_fkey'
  ) THEN
    ALTER TABLE solicitacoes_servico
      ADD CONSTRAINT solicitacoes_servico_cliente_id_fkey
      FOREIGN KEY (cliente_id) REFERENCES pessoas(id) ON DELETE SET NULL;
  END IF;

  -- FK para categoria_id -> servico_categorias
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'solicitacoes_servico_categoria_id_fkey'
  ) THEN
    ALTER TABLE solicitacoes_servico
      ADD CONSTRAINT solicitacoes_servico_categoria_id_fkey
      FOREIGN KEY (categoria_id) REFERENCES servico_categorias(id) ON DELETE SET NULL;
  END IF;

  -- FK para projeto_id -> contratos
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'solicitacoes_servico_projeto_id_fkey'
  ) THEN
    ALTER TABLE solicitacoes_servico
      ADD CONSTRAINT solicitacoes_servico_projeto_id_fkey
      FOREIGN KEY (projeto_id) REFERENCES contratos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 9. VIEW: vw_dashboard_servicos (se não existir)
-- ============================================================

CREATE OR REPLACE VIEW vw_dashboard_servicos AS
SELECT
  COUNT(*) FILTER (WHERE status = 'criado') AS total_criados,
  COUNT(*) FILTER (WHERE status = 'enviado') AS total_enviados,
  COUNT(*) FILTER (WHERE status = 'aceito') AS total_aceitos,
  COUNT(*) FILTER (WHERE status = 'em_andamento') AS total_em_andamento,
  COUNT(*) FILTER (WHERE status = 'concluido') AS total_concluidos,
  COUNT(*) FILTER (WHERE status = 'cancelado') AS total_cancelados,
  COALESCE(SUM(valor_servico) FILTER (WHERE status = 'concluido'), 0) AS valor_total_concluido,
  COALESCE(SUM(valor_servico) FILTER (WHERE status IN ('aceito', 'em_andamento')), 0) AS valor_em_execucao,
  COUNT(*) AS total_geral
FROM solicitacoes_servico;

GRANT SELECT ON vw_dashboard_servicos TO authenticated;

-- ============================================================
-- 10. VIEW: vw_prestadores_por_categoria (se não existir)
-- ============================================================

CREATE OR REPLACE VIEW vw_prestadores_por_categoria AS
SELECT
  pcv.id AS vinculo_id,
  pcv.prestador_id,
  pcv.categoria_id,
  pcv.principal,
  p.id,
  p.nome,
  p.email,
  p.telefone,
  p.tipo,
  p.ativo,
  sc.nome AS categoria_nome
FROM prestador_categoria_vinculo pcv
JOIN pessoas p ON pcv.prestador_id = p.id
LEFT JOIN servico_categorias sc ON pcv.categoria_id = sc.id
WHERE p.tipo IN ('FORNECEDOR', 'COLABORADOR');

GRANT SELECT ON vw_prestadores_por_categoria TO authenticated;
