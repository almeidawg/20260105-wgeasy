-- ============================================================
-- CORREÇÃO DE POLÍTICAS DUPLICADAS E PROBLEMÁTICAS
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-09
-- ============================================================
-- ATENÇÃO: Execute cada seção individualmente e verifique o resultado
-- ============================================================

-- ============================================================
-- 1. REMOVER POLÍTICAS DUPLICADAS EM solicitacoes_pagamento
-- ============================================================

-- Verificar políticas atuais
SELECT policyname, cmd, qual FROM pg_policies
WHERE tablename = 'solicitacoes_pagamento' ORDER BY policyname;

-- Remover duplicadas (manter apenas as com prefixo solicitacoes_pagamento_)
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON solicitacoes_pagamento;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON solicitacoes_pagamento;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON solicitacoes_pagamento;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON solicitacoes_pagamento;

-- ============================================================
-- 2. REMOVER POLÍTICAS DUPLICADAS NAS TABELAS DE COMPRAS
-- ============================================================

-- categorias_compras
DROP POLICY IF EXISTS "Allow all for authenticated" ON categorias_compras;

-- projeto_lista_compras
DROP POLICY IF EXISTS "Allow all for authenticated" ON projeto_lista_compras;

-- produtos_complementares
DROP POLICY IF EXISTS "Allow all for authenticated" ON produtos_complementares;

-- projetos_compras
DROP POLICY IF EXISTS "Allow all for authenticated" ON projetos_compras;

-- projeto_quantitativo
DROP POLICY IF EXISTS "Allow all for authenticated" ON projeto_quantitativo;

-- fluxo_financeiro_compras
DROP POLICY IF EXISTS "Allow all for authenticated" ON fluxo_financeiro_compras;

-- ============================================================
-- 3. MELHORAR POLÍTICAS MUITO PERMISSIVAS
-- ============================================================

-- nucleos_oportunidades_posicoes - Adicionar verificação de auth
DROP POLICY IF EXISTS nucleos_oportunidades_posicoes_select ON nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS nucleos_oportunidades_posicoes_update ON nucleos_oportunidades_posicoes;
DROP POLICY IF EXISTS nucleos_oportunidades_posicoes_delete ON nucleos_oportunidades_posicoes;

CREATE POLICY nucleos_oportunidades_posicoes_select ON nucleos_oportunidades_posicoes
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY nucleos_oportunidades_posicoes_update ON nucleos_oportunidades_posicoes
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY nucleos_oportunidades_posicoes_delete ON nucleos_oportunidades_posicoes
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 4. MELHORAR POLÍTICAS DE contratos_nucleos
-- ============================================================

DROP POLICY IF EXISTS contratos_nucleos_all ON contratos_nucleos;
DROP POLICY IF EXISTS contratos_nucleos_select ON contratos_nucleos;

CREATE POLICY contratos_nucleos_select ON contratos_nucleos
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY contratos_nucleos_insert ON contratos_nucleos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY contratos_nucleos_update ON contratos_nucleos
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY contratos_nucleos_delete ON contratos_nucleos
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 5. VERIFICAR RESULTADO
-- ============================================================

-- Contar políticas por tabela
SELECT
  tablename,
  COUNT(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) > 4
ORDER BY COUNT(*) DESC;

-- Verificar se ainda há políticas com TRUE
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
ORDER BY tablename;
