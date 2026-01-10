-- ============================================================
-- AUDITORIA DE PROBLEMAS E SUGESTÕES DE LIMPEZA
-- Sistema WG Easy - Grupo WG Almeida
-- ============================================================

-- ============================================================
-- A. VIEWS QUE PODEM SER REMOVIDAS
-- (Views que começam com prefixos de teste ou temporárias)
-- ============================================================
SELECT
  viewname,
  'POSSÍVEL REMOÇÃO - nome sugere ser temporária' as sugestao
FROM pg_views
WHERE schemaname = 'public'
  AND (
    viewname LIKE 'temp_%'
    OR viewname LIKE 'test_%'
    OR viewname LIKE 'tmp_%'
    OR viewname LIKE 'old_%'
    OR viewname LIKE 'backup_%'
    OR viewname LIKE '%_old'
    OR viewname LIKE '%_backup'
    OR viewname LIKE '%_temp'
    OR viewname LIKE '%_test'
  )
ORDER BY viewname;

-- ============================================================
-- B. FUNÇÕES QUE PODEM SER REMOVIDAS
-- ============================================================
SELECT
  proname as funcao,
  'POSSÍVEL REMOÇÃO - nome sugere ser temporária' as sugestao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    proname LIKE 'temp_%'
    OR proname LIKE 'test_%'
    OR proname LIKE 'tmp_%'
    OR proname LIKE 'old_%'
    OR proname LIKE '%_old'
    OR proname LIKE '%_backup'
  )
ORDER BY proname;

-- ============================================================
-- C. POLÍTICAS RLS DUPLICADAS OU CONFLITANTES
-- (Mesma tabela com políticas similares)
-- ============================================================
SELECT
  tablename,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) > 3
ORDER BY COUNT(*) DESC;

-- ============================================================
-- D. TABELAS VAZIAS (possíveis tabelas não usadas)
-- ============================================================
SELECT
  schemaname,
  relname as tabela,
  n_live_tup as registros
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup = 0
ORDER BY relname;

-- ============================================================
-- E. ÍNDICES NÃO UTILIZADOS
-- ============================================================
SELECT
  schemaname,
  relname as tabela,
  indexrelname as indice,
  idx_scan as vezes_usado,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamanho
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================
-- F. VERIFICAR USUÁRIOS AUTH SEM REGISTRO EM USUARIOS
-- ============================================================
SELECT
  au.id as auth_user_id,
  au.email,
  au.created_at,
  'Usuário no auth.users sem registro na tabela usuarios' as problema
FROM auth.users au
LEFT JOIN usuarios u ON au.id = u.auth_user_id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- ============================================================
-- G. REGISTROS EM USUARIOS SEM AUTH.USER
-- ============================================================
SELECT
  u.id,
  u.pessoa_id,
  u.tipo_usuario,
  'Registro em usuarios sem auth.user correspondente' as problema
FROM usuarios u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE au.id IS NULL
  AND u.auth_user_id IS NOT NULL;

-- ============================================================
-- H. PESSOAS SEM USUÁRIO (quando deveriam ter)
-- ============================================================
SELECT
  p.id,
  p.nome,
  p.email,
  p.tipo,
  'Pessoa sem usuário associado' as observacao
FROM pessoas p
LEFT JOIN usuarios u ON u.pessoa_id = p.id
WHERE u.id IS NULL
  AND p.tipo IN ('COLABORADOR', 'CLIENTE', 'ESPECIFICADOR', 'FORNECEDOR')
  AND p.ativo = true
ORDER BY p.tipo, p.nome;

-- ============================================================
-- I. FUNÇÕES SECURITY DEFINER (listar para revisão manual)
-- (Potencial vulnerabilidade de segurança)
-- ============================================================
SELECT
  p.proname as funcao,
  pg_get_function_arguments(p.oid) as argumentos,
  'REVISAR: SECURITY DEFINER - verificar search_path' as risco,
  COALESCE(array_to_string(p.proconfig, ', '), 'SEM CONFIG') as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- ============================================================
-- J. POLÍTICAS COM auth.uid() QUE PODEM FALHAR
-- ============================================================
SELECT
  tablename,
  policyname,
  qual as condicao,
  'Usa auth.uid() - verificar se funciona para anon' as observacao
FROM pg_policies
WHERE schemaname = 'public'
  AND qual LIKE '%auth.uid()%'
ORDER BY tablename;

-- ============================================================
-- K. VERIFICAR CONFLITOS DE NOMES
-- (Tabelas e Views com nomes similares)
-- ============================================================
WITH all_objects AS (
  SELECT table_name as nome, 'TABELA' as tipo
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  UNION ALL
  SELECT viewname as nome, 'VIEW' as tipo
  FROM pg_views
  WHERE schemaname = 'public'
)
SELECT
  a.nome as objeto1,
  a.tipo as tipo1,
  b.nome as objeto2,
  b.tipo as tipo2,
  'Nomes muito similares - possível confusão' as alerta
FROM all_objects a
JOIN all_objects b ON a.nome < b.nome
WHERE
  a.nome != b.nome
  AND (
    a.nome LIKE b.nome || '%'
    OR b.nome LIKE a.nome || '%'
    OR SIMILARITY(a.nome, b.nome) > 0.8
  )
ORDER BY a.nome;

-- ============================================================
-- L. LISTAR TODAS AS EXTENSÕES INSTALADAS
-- ============================================================
SELECT
  extname as extensao,
  extversion as versao
FROM pg_extension
ORDER BY extname;

-- ============================================================
-- M. SCRIPTS DE LIMPEZA SUGERIDOS
-- (NÃO EXECUTE AUTOMATICAMENTE - REVISE PRIMEIRO!)
-- ============================================================

-- Gera comandos DROP para views temporárias
SELECT
  'DROP VIEW IF EXISTS ' || viewname || ' CASCADE;' as comando_drop
FROM pg_views
WHERE schemaname = 'public'
  AND (
    viewname LIKE 'temp_%'
    OR viewname LIKE 'test_%'
    OR viewname LIKE 'tmp_%'
  )
ORDER BY viewname;

-- ============================================================
-- N. RESUMO DE PROBLEMAS ENCONTRADOS
-- ============================================================
SELECT 'RESUMO DA AUDITORIA' as secao, '' as detalhes
UNION ALL
SELECT '-------------------', ''
UNION ALL
SELECT
  'Views possivelmente temporárias',
  COUNT(*)::TEXT
FROM pg_views
WHERE schemaname = 'public'
  AND (viewname LIKE 'temp_%' OR viewname LIKE 'test_%')
UNION ALL
SELECT
  'Tabelas vazias',
  COUNT(*)::TEXT
FROM pg_stat_user_tables
WHERE schemaname = 'public' AND n_live_tup = 0
UNION ALL
SELECT
  'Índices não utilizados',
  COUNT(*)::TEXT
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
UNION ALL
SELECT
  'Políticas RLS muito permissivas',
  COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public' AND (qual = 'true' OR qual IS NULL)
UNION ALL
SELECT
  'Funções SECURITY DEFINER',
  COUNT(*)::TEXT
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.prosecdef = true;
