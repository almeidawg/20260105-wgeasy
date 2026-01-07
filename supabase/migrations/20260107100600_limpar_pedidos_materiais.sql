-- ============================================================================
-- MIGRAÇÃO: Limpar Módulo de Planejamento/Pedidos de Materiais
-- Data: 2026-01-07
-- Descrição: Remove todos os dados de orçamentos e pedidos de materiais
-- ============================================================================

-- Usar SQL dinâmico para ignorar tabelas que não existem
DO $$
DECLARE
  tabela TEXT;
  tabelas TEXT[] := ARRAY[
    'orcamentos_itens',
    'orcamentos_historico',
    'orcamentos',
    'pedidos_compra_itens',
    'pedidos_compra',
    'pedidos_materiais',
    'projeto_lista_compras',
    'projetos_compras'
  ];
BEGIN
  FOREACH tabela IN ARRAY tabelas LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tabela
    ) THEN
      EXECUTE format('DELETE FROM %I', tabela);
      RAISE NOTICE 'Tabela % limpa', tabela;
    ELSE
      RAISE NOTICE 'Tabela % não existe, ignorando', tabela;
    END IF;
  END LOOP;

  RAISE NOTICE 'Limpeza do módulo de planejamento concluída!';
END $$;
