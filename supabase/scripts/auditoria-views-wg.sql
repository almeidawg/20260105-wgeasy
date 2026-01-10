-- ============================================================
-- AUDITORIA ESPECÍFICA DAS VIEWS DO SISTEMA WG
-- Sistema WG Easy - Grupo WG Almeida
-- ============================================================

-- ============================================================
-- 1. LISTAR TODAS AS VIEWS DO SISTEMA WG
-- ============================================================
SELECT
  viewname,
  CASE
    WHEN viewname LIKE 'vw_%' THEN 'Padrão WG'
    WHEN viewname LIKE 'view_%' THEN 'Padrão view_'
    ELSE 'Outro padrão'
  END as padrao_nome,
  LENGTH(definition) as tamanho_definicao
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- ============================================================
-- 2. TESTAR CADA VIEW (verificar se está funcionando)
-- Execute este bloco para ver quais views têm problemas
-- ============================================================
DO $$
DECLARE
  v_rec RECORD;
  v_count INTEGER;
BEGIN
  RAISE NOTICE '=== TESTE DE VIEWS ===';

  FOR v_rec IN
    SELECT viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname
  LOOP
    BEGIN
      EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(v_rec.viewname) INTO v_count;
      RAISE NOTICE 'OK: % - % registros', v_rec.viewname, v_count;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'ERRO: % - %', v_rec.viewname, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================================
-- 3. VIEWS CRÍTICAS DO SISTEMA WG
-- Verificar se existem e estão funcionando
-- ============================================================
SELECT
  'vw_usuarios_completo' as view_esperada,
  CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_usuarios_completo') THEN 'EXISTE' ELSE 'FALTANDO' END as status
UNION ALL
SELECT 'vw_clientes', CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_clientes') THEN 'EXISTE' ELSE 'FALTANDO' END
UNION ALL
SELECT 'vw_colaboradores', CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_colaboradores') THEN 'EXISTE' ELSE 'FALTANDO' END
UNION ALL
SELECT 'vw_fornecedores', CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_fornecedores') THEN 'EXISTE' ELSE 'FALTANDO' END
UNION ALL
SELECT 'vw_contratos_completos', CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_contratos_completos') THEN 'EXISTE' ELSE 'FALTANDO' END
UNION ALL
SELECT 'vw_propostas_completas', CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_propostas_completas') THEN 'EXISTE' ELSE 'FALTANDO' END
UNION ALL
SELECT 'vw_lancamentos_financeiros', CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_lancamentos_financeiros') THEN 'EXISTE' ELSE 'FALTANDO' END
UNION ALL
SELECT 'vw_dashboard_servicos', CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'vw_dashboard_servicos') THEN 'EXISTE' ELSE 'FALTANDO' END;

-- ============================================================
-- 4. VERIFICAR DEFINIÇÃO DA VW_USUARIOS_COMPLETO
-- ============================================================
SELECT
  'Colunas da vw_usuarios_completo' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'vw_usuarios_completo'
ORDER BY ordinal_position;

-- ============================================================
-- 5. VERIFICAR SE GOOGLE_WORKSPACE_EMAIL ESTÁ NA VIEW
-- ============================================================
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'vw_usuarios_completo'
      AND column_name = 'google_workspace_email'
    ) THEN 'SIM - Campo google_workspace_email está na view'
    ELSE 'NAO - Campo google_workspace_email NÃO está na view (precisa atualizar)'
  END as status_google_email;

-- ============================================================
-- 6. VERIFICAR PERMISSÕES DAS VIEWS
-- ============================================================
SELECT
  v.viewname,
  COALESCE(
    STRING_AGG(DISTINCT p.grantee || ':' || p.privilege_type, ', '),
    'SEM GRANTS'
  ) as permissoes
FROM pg_views v
LEFT JOIN information_schema.table_privileges p
  ON p.table_name = v.viewname AND p.table_schema = 'public'
WHERE v.schemaname = 'public'
GROUP BY v.viewname
ORDER BY v.viewname;

-- ============================================================
-- 7. VIEWS QUE DEPENDEM DE OUTRAS VIEWS
-- ============================================================
WITH RECURSIVE view_deps AS (
  SELECT
    v.viewname as view_name,
    d.viewname as depends_on
  FROM pg_views v
  CROSS JOIN pg_views d
  WHERE v.schemaname = 'public'
    AND d.schemaname = 'public'
    AND v.viewname != d.viewname
    AND v.definition LIKE '%' || d.viewname || '%'
)
SELECT
  view_name,
  STRING_AGG(depends_on, ', ') as depende_de
FROM view_deps
GROUP BY view_name
ORDER BY view_name;

-- ============================================================
-- 8. VIEWS SEM DEPENDÊNCIAS (independentes)
-- ============================================================
SELECT
  viewname as view_independente,
  'Não depende de outras views' as status
FROM pg_views v
WHERE schemaname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_views v2
    WHERE v2.schemaname = 'public'
      AND v.viewname != v2.viewname
      AND v.definition LIKE '%' || v2.viewname || '%'
  )
ORDER BY viewname;

-- ============================================================
-- 9. VERIFICAR COLUNAS DA TABELA USUARIOS
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- ============================================================
-- 10. COMPARAR USUARIOS COM VW_USUARIOS_COMPLETO
-- ============================================================
WITH cols_tabela AS (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'usuarios' AND table_schema = 'public'
),
cols_view AS (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'vw_usuarios_completo' AND table_schema = 'public'
)
SELECT
  'Na tabela mas não na view' as status,
  ct.column_name
FROM cols_tabela ct
LEFT JOIN cols_view cv ON ct.column_name = cv.column_name
WHERE cv.column_name IS NULL
UNION ALL
SELECT
  'Na view mas não na tabela' as status,
  cv.column_name
FROM cols_view cv
LEFT JOIN cols_tabela ct ON ct.column_name = cv.column_name
WHERE ct.column_name IS NULL;
