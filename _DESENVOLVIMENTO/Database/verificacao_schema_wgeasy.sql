-- SCRIPT DE VERIFICAÇÃO AUTOMÁTICA DO SCHEMA WG EASY
-- Gera alertas para problemas críticos antes de importações
-- Execute no Supabase ou PostgreSQL

-- 1. Verificar se há FKs apontando para schemas arquivados (z_archive)
SELECT
    'ERRO: FK apontando para schema arquivado: ' || tc.table_name || '.' || tc.constraint_name || ' -> ' || ccu.table_schema AS alerta
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema LIKE 'z_archive%';

-- 2. Verificar se trigger contratos_preencher_campos usa campos corretos
SELECT
    CASE
        WHEN position('numero' in pg_get_functiondef(p.oid)) > 0 OR
             position('data_inicio' in pg_get_functiondef(p.oid)) > 0 OR
             position('duracao_dias_uteis' in pg_get_functiondef(p.oid)) > 0 OR
             position('data_previsao_termino' in pg_get_functiondef(p.oid)) > 0
        THEN 'ERRO: Trigger contratos_preencher_campos usa campos inválidos!'
        ELSE 'OK: Trigger contratos_preencher_campos corrigida.'
    END AS alerta
FROM pg_proc p
WHERE proname = 'contratos_preencher_campos';

-- 3. Verificar se FKs de contratos_nucleos apontam para public.oportunidades
SELECT
    CASE WHEN ccu.table_schema = 'public' AND ccu.table_name = 'oportunidades'
        THEN 'OK: FK contratos_nucleos.oportunidade_id correta.'
        ELSE 'ERRO: FK contratos_nucleos.oportunidade_id incorreta!'
    END AS alerta
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'contratos_nucleos'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.column_name = 'id';

-- 4. Verificar se FKs de tasks para schemas arquivados foram removidas
SELECT
    CASE WHEN COUNT(*) = 0 THEN 'OK: FKs tasks removidas.'
         ELSE 'ERRO: FKs tasks ainda existem!'
    END AS alerta
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tasks'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema LIKE 'z_archive%';

-- 5. Verificar constraints de valores permitidos (exemplo para contratos_itens.nucleo)
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name LIKE '%contratos_itens_nucleo%'
          AND check_clause LIKE '%arquitetura%'
          AND check_clause LIKE '%engenharia%'
          AND check_clause LIKE '%marcenaria%'
          AND check_clause LIKE '%produtos%'
          AND check_clause LIKE '%materiais%'
    ) THEN 'OK: Constraint contratos_itens.nucleo correta.'
      ELSE 'ERRO: Constraint contratos_itens.nucleo incorreta!'
    END AS alerta;

-- Repita para outras constraints conforme necessário (obras_etapas.tipo, tasks.status)

-- 6. Verificar constraint de valores permitidos para obras_etapas.tipo
SELECT
        CASE WHEN EXISTS (
                SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name LIKE '%obras_etapas_tipo%'
                    AND check_clause LIKE '%macro%'
                    AND check_clause LIKE '%subetapa%'
        ) THEN 'OK: Constraint obras_etapas.tipo correta.'
            ELSE 'ERRO: Constraint obras_etapas.tipo incorreta!'
        END AS alerta;

-- 7. Verificar constraint de valores permitidos para tasks.status
SELECT
        CASE WHEN EXISTS (
                SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name LIKE '%tasks_status%'
                    AND check_clause LIKE '%Pendente%'
                    AND check_clause LIKE '%Em Andamento%'
                    AND check_clause LIKE '%Concluído%'
                    AND check_clause LIKE '%Atrasado%'
        ) THEN 'OK: Constraint tasks.status correta.'
            ELSE 'ERRO: Constraint tasks.status incorreta!'
        END AS alerta;
