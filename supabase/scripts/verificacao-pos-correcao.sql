-- ============================================================
-- VERIFICAÇÃO PÓS-CORREÇÃO - Sistema WG Easy
-- Data: 2026-01-09
-- ============================================================
-- Execute após aplicar as correções para validar
-- ============================================================

-- ============================================================
-- 1. RESUMO DE POLÍTICAS POR TABELA
-- ============================================================
SELECT
  tablename,
  COUNT(*) as total_politicas,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
  COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
  COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) > 4
ORDER BY COUNT(*) DESC;

-- ============================================================
-- 2. POLÍTICAS AINDA COM TRUE (problemáticas)
-- ============================================================
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
ORDER BY tablename;

-- ============================================================
-- 3. TABELAS CRÍTICAS - VERIFICAR CORREÇÃO
-- ============================================================
SELECT
  'fin_transactions' as tabela,
  COUNT(*) as total,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies WHERE tablename = 'fin_transactions'
UNION ALL
SELECT
  'contratos',
  COUNT(*),
  STRING_AGG(policyname, ', ')
FROM pg_policies WHERE tablename = 'contratos'
UNION ALL
SELECT
  'pessoas',
  COUNT(*),
  STRING_AGG(policyname, ', ')
FROM pg_policies WHERE tablename = 'pessoas'
UNION ALL
SELECT
  'reembolsos',
  COUNT(*),
  STRING_AGG(policyname, ', ')
FROM pg_policies WHERE tablename = 'reembolsos'
UNION ALL
SELECT
  'comissoes',
  COUNT(*),
  STRING_AGG(policyname, ', ')
FROM pg_policies WHERE tablename = 'comissoes'
UNION ALL
SELECT
  'usuarios_perfis',
  COUNT(*),
  STRING_AGG(policyname, ', ')
FROM pg_policies WHERE tablename = 'usuarios_perfis'
UNION ALL
SELECT
  'oportunidades',
  COUNT(*),
  STRING_AGG(policyname, ', ')
FROM pg_policies WHERE tablename = 'oportunidades';

-- ============================================================
-- 4. NOVO RESUMO GERAL
-- ============================================================
SELECT 'RESUMO PÓS-CORREÇÃO' as secao, '' as valor
UNION ALL
SELECT '-------------------', ''
UNION ALL
SELECT
  'Total de políticas',
  COUNT(*)::TEXT
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT
  'Políticas com TRUE',
  COUNT(*)::TEXT
FROM pg_policies WHERE schemaname = 'public' AND qual = 'true'
UNION ALL
SELECT
  'Políticas com verificação de tipo_usuario',
  COUNT(*)::TEXT
FROM pg_policies WHERE schemaname = 'public' AND qual LIKE '%tipo_usuario%'
UNION ALL
SELECT
  'Políticas com verificação de auth.uid()',
  COUNT(*)::TEXT
FROM pg_policies WHERE schemaname = 'public' AND qual LIKE '%auth.uid()%';

-- ============================================================
-- 5. TESTE DE ACESSO (simular diferentes usuários)
-- ============================================================

-- Criar função para testar acesso
CREATE OR REPLACE FUNCTION test_policy_access(p_table TEXT, p_tipo_usuario TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_policy_count INTEGER;
BEGIN
  -- Contar políticas da tabela
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = p_table
    AND schemaname = 'public';

  IF v_policy_count = 0 THEN
    RETURN 'SEM POLÍTICAS - ACESSO TOTAL';
  END IF;

  -- Verificar se há política para o tipo
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = p_table
      AND schemaname = 'public'
      AND qual LIKE '%' || p_tipo_usuario || '%'
  ) THEN
    RETURN 'TEM ACESSO ESPECÍFICO';
  ELSIF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = p_table
      AND schemaname = 'public'
      AND qual = 'true'
  ) THEN
    RETURN 'ACESSO VIA TRUE (REVISAR)';
  ELSE
    RETURN 'SEM ACESSO DIRETO';
  END IF;
END;
$$;

-- Testar acesso para diferentes tipos em tabelas críticas
SELECT
  tabela,
  test_policy_access(tabela, 'MASTER') as master,
  test_policy_access(tabela, 'ADMIN') as admin,
  test_policy_access(tabela, 'FINANCEIRO') as financeiro,
  test_policy_access(tabela, 'COMERCIAL') as comercial,
  test_policy_access(tabela, 'CLIENTE') as cliente
FROM (
  VALUES
    ('fin_transactions'),
    ('contratos'),
    ('pessoas'),
    ('reembolsos'),
    ('comissoes'),
    ('oportunidades')
) AS t(tabela);

-- Limpar função de teste
DROP FUNCTION IF EXISTS test_policy_access(TEXT, TEXT);
