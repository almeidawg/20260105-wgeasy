-- ============================================================
-- CORREÇÃO DE POLÍTICAS DUPLICADAS - Sistema WG Easy
-- Data: 2026-01-09
-- ============================================================
-- Remove políticas duplicadas e mantém apenas uma versão
-- ============================================================

-- ============================================================
-- 1. NOTIFICACOES_SISTEMA (6 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "notificacoes_sistema_select" ON notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_update" ON notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_delete" ON notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_update_policy" ON notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_select_policy" ON notificacoes_sistema;
DROP POLICY IF EXISTS "Admins podem ver todas notificacoes" ON notificacoes_sistema;

CREATE POLICY notificacoes_sistema_select ON notificacoes_sistema
  FOR SELECT TO authenticated
  USING (
    usuario_id IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
    )
  );

CREATE POLICY notificacoes_sistema_insert ON notificacoes_sistema
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY notificacoes_sistema_update ON notificacoes_sistema
  FOR UPDATE TO authenticated
  USING (
    usuario_id IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

CREATE POLICY notificacoes_sistema_delete ON notificacoes_sistema
  FOR DELETE TO authenticated
  USING (
    usuario_id IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
    )
  );

-- ============================================================
-- 2. PRICELIST_CATEGORIAS (7 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "pricelist_categorias_all" ON pricelist_categorias;
DROP POLICY IF EXISTS "pricelist_categorias_select" ON pricelist_categorias;
DROP POLICY IF EXISTS "pricelist_categorias_select_auth" ON pricelist_categorias;
DROP POLICY IF EXISTS "pricelist_categorias_delete_all" ON pricelist_categorias;
DROP POLICY IF EXISTS "pricelist_categorias_update_all" ON pricelist_categorias;
DROP POLICY IF EXISTS "pricelist_categorias_all_auth" ON pricelist_categorias;
DROP POLICY IF EXISTS "pricelist_categorias_select_all" ON pricelist_categorias;

CREATE POLICY pricelist_categorias_select ON pricelist_categorias
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY pricelist_categorias_insert ON pricelist_categorias
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL')
      AND u.ativo = true
    )
  );

CREATE POLICY pricelist_categorias_update ON pricelist_categorias
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL')
      AND u.ativo = true
    )
  );

CREATE POLICY pricelist_categorias_delete ON pricelist_categorias
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 3. PRICELIST_ITENS (8 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "pricelist_itens_select" ON pricelist_itens;
DROP POLICY IF EXISTS "pricelist_itens_update" ON pricelist_itens;
DROP POLICY IF EXISTS "pricelist_itens_delete" ON pricelist_itens;
DROP POLICY IF EXISTS "pricelist_itens_all_auth" ON pricelist_itens;
DROP POLICY IF EXISTS "pricelist_itens_select_auth" ON pricelist_itens;
DROP POLICY IF EXISTS "pricelist_itens_select_all" ON pricelist_itens;
DROP POLICY IF EXISTS "pricelist_itens_update_all" ON pricelist_itens;
DROP POLICY IF EXISTS "pricelist_itens_delete_all" ON pricelist_itens;

CREATE POLICY pricelist_itens_select ON pricelist_itens
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY pricelist_itens_insert ON pricelist_itens
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL')
      AND u.ativo = true
    )
  );

CREATE POLICY pricelist_itens_update ON pricelist_itens
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL')
      AND u.ativo = true
    )
  );

CREATE POLICY pricelist_itens_delete ON pricelist_itens
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 4. PRICELIST_SUBCATEGORIAS (7 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "pricelist_subcategorias_all_auth" ON pricelist_subcategorias;
DROP POLICY IF EXISTS "pricelist_subcategorias_select" ON pricelist_subcategorias;
DROP POLICY IF EXISTS "pricelist_subcategorias_select_all" ON pricelist_subcategorias;
DROP POLICY IF EXISTS "pricelist_subcategorias_update_all" ON pricelist_subcategorias;
DROP POLICY IF EXISTS "pricelist_subcategorias_delete_all" ON pricelist_subcategorias;
DROP POLICY IF EXISTS "pricelist_subcategorias_all_authenticated" ON pricelist_subcategorias;
DROP POLICY IF EXISTS "pricelist_subcategorias_select_auth" ON pricelist_subcategorias;

CREATE POLICY pricelist_subcategorias_select ON pricelist_subcategorias
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY pricelist_subcategorias_insert ON pricelist_subcategorias
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL')
      AND u.ativo = true
    )
  );

CREATE POLICY pricelist_subcategorias_update ON pricelist_subcategorias
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL')
      AND u.ativo = true
    )
  );

CREATE POLICY pricelist_subcategorias_delete ON pricelist_subcategorias
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 5. PEDIDOS_COMPRA (7 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "pedidos_compra_delete" ON pedidos_compra;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar pedidos" ON pedidos_compra;
DROP POLICY IF EXISTS "pedidos_compra_select" ON pedidos_compra;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar pedidos" ON pedidos_compra;
DROP POLICY IF EXISTS "Usuários autenticados podem ler pedidos" ON pedidos_compra;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar pedidos" ON pedidos_compra;
DROP POLICY IF EXISTS "pedidos_compra_update" ON pedidos_compra;

CREATE POLICY pedidos_compra_select ON pedidos_compra
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY pedidos_compra_insert ON pedidos_compra
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY pedidos_compra_update ON pedidos_compra
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY pedidos_compra_delete ON pedidos_compra
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 6. PEDIDOS_COMPRA_ITENS (7 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "pedidos_compra_itens_delete" ON pedidos_compra_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem ler itens" ON pedidos_compra_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar itens" ON pedidos_compra_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar itens" ON pedidos_compra_itens;
DROP POLICY IF EXISTS "pedidos_compra_itens_select" ON pedidos_compra_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar itens" ON pedidos_compra_itens;
DROP POLICY IF EXISTS "pedidos_compra_itens_update" ON pedidos_compra_itens;

CREATE POLICY pedidos_compra_itens_select ON pedidos_compra_itens
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY pedidos_compra_itens_insert ON pedidos_compra_itens
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY pedidos_compra_itens_update ON pedidos_compra_itens
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY pedidos_compra_itens_delete ON pedidos_compra_itens
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 7. CEO_CHECKLIST_ITENS (6 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "ceo_checklist_itens_update" ON ceo_checklist_itens;
DROP POLICY IF EXISTS "ceo_checklist_itens_select" ON ceo_checklist_itens;
DROP POLICY IF EXISTS "ceo_checklist_itens_delete" ON ceo_checklist_itens;
DROP POLICY IF EXISTS "Usuários podem ver itens" ON ceo_checklist_itens;
DROP POLICY IF EXISTS "Usuários podem atualizar itens" ON ceo_checklist_itens;
DROP POLICY IF EXISTS "Usuários podem deletar itens" ON ceo_checklist_itens;

CREATE POLICY ceo_checklist_itens_select ON ceo_checklist_itens
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY ceo_checklist_itens_insert ON ceo_checklist_itens
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY ceo_checklist_itens_update ON ceo_checklist_itens
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY ceo_checklist_itens_delete ON ceo_checklist_itens
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 8. CEO_CHECKLIST_MENCOES (4 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "Usuários podem atualizar suas menções" ON ceo_checklist_mencoes;
DROP POLICY IF EXISTS "Usuários podem ver menções" ON ceo_checklist_mencoes;
DROP POLICY IF EXISTS "ceo_checklist_mencoes_select" ON ceo_checklist_mencoes;
DROP POLICY IF EXISTS "ceo_checklist_mencoes_update" ON ceo_checklist_mencoes;

CREATE POLICY ceo_checklist_mencoes_select ON ceo_checklist_mencoes
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY ceo_checklist_mencoes_insert ON ceo_checklist_mencoes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY ceo_checklist_mencoes_update ON ceo_checklist_mencoes
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY ceo_checklist_mencoes_delete ON ceo_checklist_mencoes
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 9. COBRANCAS (5 políticas -> 4)
-- ============================================================

DROP POLICY IF EXISTS "select_cobrancas" ON cobrancas;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON cobrancas;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON cobrancas;
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON cobrancas;
DROP POLICY IF EXISTS "update_cobrancas" ON cobrancas;

CREATE POLICY cobrancas_select ON cobrancas
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO', 'COMERCIAL')
      AND u.ativo = true
    )
  );

CREATE POLICY cobrancas_insert ON cobrancas
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
  );

CREATE POLICY cobrancas_update ON cobrancas
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
  );

CREATE POLICY cobrancas_delete ON cobrancas
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 10. SOLICITACOES_PAGAMENTO (já tratado anteriormente)
-- ============================================================

DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON solicitacoes_pagamento;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON solicitacoes_pagamento;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON solicitacoes_pagamento;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON solicitacoes_pagamento;
-- Manter as políticas solicitacoes_pagamento_*

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- Contar políticas após correção
SELECT
  tablename,
  COUNT(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'notificacoes_sistema',
    'pricelist_categorias',
    'pricelist_itens',
    'pricelist_subcategorias',
    'pedidos_compra',
    'pedidos_compra_itens',
    'ceo_checklist_itens',
    'ceo_checklist_mencoes',
    'cobrancas',
    'solicitacoes_pagamento'
  )
GROUP BY tablename
ORDER BY tablename;
