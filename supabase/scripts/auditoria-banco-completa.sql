-- ============================================================
-- AUDITORIA COMPLETA DO BANCO DE DADOS
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-09
-- ============================================================
-- Execute cada seção separadamente para analisar o resultado
-- ============================================================

-- ============================================================
-- 1. LISTAR TODAS AS VIEWS
-- ============================================================
SELECT
  schemaname,
  viewname,
  viewowner,
  pg_size_pretty(pg_relation_size(schemaname || '.' || viewname)) as tamanho
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- ============================================================
-- 2. LISTAR TODAS AS POLÍTICAS RLS (Row Level Security)
-- ============================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- 3. TABELAS COM RLS ATIVADO/DESATIVADO
-- ============================================================
SELECT
  c.relname as tabela,
  c.relrowsecurity as rls_ativado,
  c.relforcerowsecurity as rls_forcado,
  CASE WHEN c.relrowsecurity THEN 'SIM' ELSE 'NAO' END as status_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- ============================================================
-- 4. LISTAR TODAS AS FUNÇÕES/PROCEDURES
-- ============================================================
SELECT
  p.proname as nome_funcao,
  pg_get_function_arguments(p.oid) as argumentos,
  CASE p.prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as seguranca,
  l.lanname as linguagem,
  p.provolatile as volatilidade,
  obj_description(p.oid, 'pg_proc') as descricao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- ============================================================
-- 5. LISTAR TODOS OS TRIGGERS
-- ============================================================
SELECT
  event_object_table as tabela,
  trigger_name,
  event_manipulation as evento,
  action_timing as quando,
  action_statement as acao
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================
-- 6. FOREIGN KEYS (Chaves Estrangeiras)
-- ============================================================
SELECT
  tc.table_name as tabela_origem,
  kcu.column_name as coluna_origem,
  ccu.table_name as tabela_destino,
  ccu.column_name as coluna_destino,
  tc.constraint_name as nome_constraint
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================
-- 7. ÍNDICES
-- ============================================================
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================
-- 8. GRANTS/PERMISSÕES POR TABELA
-- ============================================================
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- ============================================================
-- 9. VIEWS SEM USO APARENTE (não referenciadas em outras views)
-- ============================================================
WITH view_refs AS (
  SELECT DISTINCT
    v1.viewname as view_origem,
    v2.viewname as view_referenciada
  FROM pg_views v1
  CROSS JOIN pg_views v2
  WHERE v1.schemaname = 'public'
    AND v2.schemaname = 'public'
    AND v1.viewname != v2.viewname
    AND v1.definition LIKE '%' || v2.viewname || '%'
)
SELECT
  v.viewname as view_isolada,
  'Não é referenciada por outras views' as status
FROM pg_views v
LEFT JOIN view_refs vr ON v.viewname = vr.view_referenciada
WHERE v.schemaname = 'public'
  AND vr.view_referenciada IS NULL
ORDER BY v.viewname;

-- ============================================================
-- 10. POLÍTICAS RLS POTENCIALMENTE PROBLEMÁTICAS
-- ============================================================
-- Políticas muito permissivas (usando TRUE)
SELECT
  tablename,
  policyname,
  'MUITO PERMISSIVA - usa TRUE' as problema,
  qual as condicao
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual = 'true' OR qual IS NULL)
ORDER BY tablename;

-- ============================================================
-- 11. TABELAS SEM POLÍTICAS RLS (mas com RLS ativado)
-- ============================================================
SELECT
  c.relname as tabela,
  'RLS ativado mas SEM políticas definidas' as problema
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.tablename = c.relname AND p.schemaname = 'public'
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
  AND p.policyname IS NULL
ORDER BY c.relname;

-- ============================================================
-- 12. FUNÇÕES SECURITY DEFINER (potencial risco)
-- ============================================================
SELECT
  p.proname as funcao,
  pg_get_function_arguments(p.oid) as argumentos,
  'SECURITY DEFINER - executa com privilégios do owner' as alerta
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- ============================================================
-- 13. ESTATÍSTICAS DE USO DO AUTH
-- ============================================================
SELECT
  COUNT(*) as total_usuarios,
  COUNT(*) FILTER (WHERE last_sign_in_at IS NOT NULL) as usuarios_que_logaram,
  COUNT(*) FILTER (WHERE last_sign_in_at > NOW() - INTERVAL '30 days') as ativos_30_dias,
  COUNT(*) FILTER (WHERE last_sign_in_at > NOW() - INTERVAL '7 days') as ativos_7_dias,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as email_nao_confirmado
FROM auth.users;

-- ============================================================
-- 14. USUÁRIOS POR TIPO
-- ============================================================
SELECT
  tipo_usuario,
  COUNT(*) as quantidade,
  COUNT(*) FILTER (WHERE ativo = true) as ativos,
  COUNT(*) FILTER (WHERE ativo = false) as inativos
FROM usuarios
GROUP BY tipo_usuario
ORDER BY quantidade DESC;

-- ============================================================
-- 15. VERIFICAR COLUNAS COM GOOGLE_WORKSPACE_EMAIL
-- ============================================================
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name LIKE '%google%'
ORDER BY table_name;

-- ============================================================
-- 16. VIEWS COM DEPENDÊNCIAS QUEBRADAS
-- ============================================================
DO $$
DECLARE
  v_name TEXT;
  v_error TEXT;
BEGIN
  FOR v_name IN
    SELECT viewname FROM pg_views WHERE schemaname = 'public'
  LOOP
    BEGIN
      EXECUTE 'SELECT 1 FROM ' || v_name || ' LIMIT 0';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'VIEW COM PROBLEMA: % - Erro: %', v_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================================
-- 17. TAMANHO DAS TABELAS
-- ============================================================
SELECT
  relname as tabela,
  pg_size_pretty(pg_total_relation_size(relid)) as tamanho_total,
  pg_size_pretty(pg_relation_size(relid)) as tamanho_dados,
  pg_size_pretty(pg_indexes_size(relid)) as tamanho_indices,
  n_live_tup as linhas_aproximadas
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 30;

-- ============================================================
-- 18. VERIFICAR INTEGRIDADE DE FKs
-- ============================================================
-- Lista FKs que podem ter registros órfãos
SELECT
  tc.table_name as tabela,
  tc.constraint_name,
  kcu.column_name as coluna,
  ccu.table_name as tabela_ref,
  ccu.column_name as coluna_ref
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================================
-- 19. RESUMO GERAL
-- ============================================================
SELECT
  'Tabelas' as tipo, COUNT(*) as quantidade
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT
  'Views' as tipo, COUNT(*) as quantidade
FROM pg_views WHERE schemaname = 'public'
UNION ALL
SELECT
  'Funções' as tipo, COUNT(*) as quantidade
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
UNION ALL
SELECT
  'Políticas RLS' as tipo, COUNT(*) as quantidade
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT
  'Triggers' as tipo, COUNT(*) as quantidade
FROM information_schema.triggers WHERE trigger_schema = 'public'
UNION ALL
SELECT
  'Índices' as tipo, COUNT(*) as quantidade
FROM pg_indexes WHERE schemaname = 'public'
ORDER BY tipo;
