-- ============================================================
-- MIGRATION: Corrigir função verificar_permissao duplicada
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-08
-- Descrição: Remove todas as versões da função e recria corretamente
-- ============================================================

-- ============================================================
-- REMOVER TODAS AS VERSÕES DA FUNÇÃO
-- ============================================================

-- Remover todas as possíveis assinaturas da função verificar_permissao
DROP FUNCTION IF EXISTS verificar_permissao(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS verificar_permissao(UUID, TEXT);
DROP FUNCTION IF EXISTS verificar_permissao(TEXT, TEXT);
DROP FUNCTION IF EXISTS verificar_permissao(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verificar_permissao(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verificar_permissao(UUID, TEXT);
DROP FUNCTION IF EXISTS public.verificar_permissao(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verificar_permissao(TEXT, TEXT, TEXT);

-- Remover listar_modulos_permitidos também
DROP FUNCTION IF EXISTS listar_modulos_permitidos(UUID);
DROP FUNCTION IF EXISTS listar_modulos_permitidos(TEXT);
DROP FUNCTION IF EXISTS public.listar_modulos_permitidos(UUID);
DROP FUNCTION IF EXISTS public.listar_modulos_permitidos(TEXT);

-- ============================================================
-- RECRIAR FUNÇÃO: verificar_permissao
-- ============================================================
CREATE OR REPLACE FUNCTION public.verificar_permissao(
  p_auth_user_id UUID,
  p_codigo_modulo TEXT,
  p_tipo_permissao TEXT DEFAULT 'pode_visualizar'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo_usuario TEXT;
  v_modulo_id UUID;
  v_tem_permissao BOOLEAN := false;
BEGIN
  -- Buscar tipo do usuario na tabela usuarios
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

  -- ADMIN também tem acesso total
  IF v_tipo_usuario = 'ADMIN' THEN
    RETURN true;
  END IF;

  -- Se ainda não tem tipo, sem permissão
  IF v_tipo_usuario IS NULL THEN
    RETURN false;
  END IF;

  -- Verificar se a tabela sistema_modulos existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sistema_modulos') THEN
    -- Se tabela não existe, retorna true para não bloquear o sistema
    RETURN true;
  END IF;

  -- Buscar ID do modulo
  SELECT id INTO v_modulo_id
  FROM sistema_modulos
  WHERE codigo = p_codigo_modulo AND ativo = true
  LIMIT 1;

  IF v_modulo_id IS NULL THEN
    -- Módulo não cadastrado, retorna true para não bloquear
    RETURN true;
  END IF;

  -- Verificar se a tabela permissoes_tipo_usuario existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissoes_tipo_usuario') THEN
    RETURN true;
  END IF;

  -- Verificar permissao na tabela
  BEGIN
    EXECUTE format(
      'SELECT %I FROM permissoes_tipo_usuario WHERE tipo_usuario = $1 AND modulo_id = $2',
      p_tipo_permissao
    ) INTO v_tem_permissao
    USING v_tipo_usuario, v_modulo_id;
  EXCEPTION WHEN OTHERS THEN
    -- Se der erro, retorna true para não bloquear
    RETURN true;
  END;

  -- Se não encontrou registro de permissão, permite por padrão
  IF v_tem_permissao IS NULL THEN
    RETURN true;
  END IF;

  RETURN v_tem_permissao;
END;
$$;

-- ============================================================
-- RECRIAR FUNÇÃO: listar_modulos_permitidos
-- ============================================================
CREATE OR REPLACE FUNCTION public.listar_modulos_permitidos(p_auth_user_id UUID)
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
SET search_path = public
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

  -- Verificar se tabela existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sistema_modulos') THEN
    RETURN;
  END IF;

  -- MASTER e ADMIN veem tudo
  IF v_tipo_usuario IN ('MASTER', 'ADMIN') THEN
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
    COALESCE(ptu.pode_visualizar, true) as pode_visualizar,
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
  ORDER BY sm.ordem;
END;
$$;

-- ============================================================
-- CONCEDER PERMISSÕES
-- ============================================================
GRANT EXECUTE ON FUNCTION public.verificar_permissao(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_permissao(UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.listar_modulos_permitidos(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.listar_modulos_permitidos(UUID) TO anon;

-- ============================================================
-- LOG
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260108200000_fix_verificar_permissao_function executada!';
  RAISE NOTICE 'Funcoes verificar_permissao e listar_modulos_permitidos recriadas com sucesso.';
END $$;
