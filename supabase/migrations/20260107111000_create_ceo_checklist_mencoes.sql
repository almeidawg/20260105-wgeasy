-- ============================================================================
-- MIGRAÇÃO: Sistema de Menções do Checklist CEO
-- Data: 2026-01-07
-- Descrição: Cria tabela para menções (@) no checklist diário do CEO/Founder
-- ============================================================================

-- ============================================================================
-- VERIFICAR SE TABELAS BASE EXISTEM (ceo_checklist_diario e ceo_checklist_itens)
-- ============================================================================

-- Criar tabela ceo_checklist_diario se não existir
CREATE TABLE IF NOT EXISTS public.ceo_checklist_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  usuario_id UUID NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint única: um checklist por usuário por dia
  CONSTRAINT uq_ceo_checklist_diario_usuario_data UNIQUE (usuario_id, data)
);

-- Criar tabela ceo_checklist_itens se não existir
CREATE TABLE IF NOT EXISTS public.ceo_checklist_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.ceo_checklist_diario(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
  concluido BOOLEAN DEFAULT FALSE,
  concluido_em TIMESTAMPTZ,
  ordem INTEGER DEFAULT 0,
  fonte TEXT DEFAULT 'manual' CHECK (fonte IN ('manual', 'mencao', 'automatico', 'recorrente')),
  referencia_id UUID,
  criado_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ceo_checklist_itens
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_itens_checklist_id
  ON public.ceo_checklist_itens(checklist_id);
CREATE INDEX IF NOT EXISTS idx_ceo_checklist_itens_criado_por
  ON public.ceo_checklist_itens(criado_por);

-- ============================================================================
-- TABELA: ceo_checklist_mencoes
-- Registra menções de usuários em itens do checklist
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ceo_checklist_mencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.ceo_checklist_itens(id) ON DELETE CASCADE,
  usuario_mencionado_id UUID NOT NULL,
  usuario_autor_id UUID NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Evitar menções duplicadas
  CONSTRAINT uq_ceo_mencao_item_usuario UNIQUE (item_id, usuario_mencionado_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ceo_mencoes_usuario_mencionado
  ON public.ceo_checklist_mencoes(usuario_mencionado_id);
CREATE INDEX IF NOT EXISTS idx_ceo_mencoes_usuario_autor
  ON public.ceo_checklist_mencoes(usuario_autor_id);
CREATE INDEX IF NOT EXISTS idx_ceo_mencoes_lido
  ON public.ceo_checklist_mencoes(usuario_mencionado_id, lido);
CREATE INDEX IF NOT EXISTS idx_ceo_mencoes_created_at
  ON public.ceo_checklist_mencoes(created_at DESC);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.ceo_checklist_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceo_checklist_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceo_checklist_mencoes ENABLE ROW LEVEL SECURITY;

-- Políticas para ceo_checklist_diario
DROP POLICY IF EXISTS "Usuários podem ver seus próprios checklists" ON public.ceo_checklist_diario;
CREATE POLICY "Usuários podem ver seus próprios checklists"
  ON public.ceo_checklist_diario
  FOR SELECT TO authenticated
  USING (true); -- Todos podem ver (facilita debugging, depois pode restringir)

DROP POLICY IF EXISTS "Usuários podem criar seus próprios checklists" ON public.ceo_checklist_diario;
CREATE POLICY "Usuários podem criar seus próprios checklists"
  ON public.ceo_checklist_diario
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios checklists" ON public.ceo_checklist_diario;
CREATE POLICY "Usuários podem atualizar seus próprios checklists"
  ON public.ceo_checklist_diario
  FOR UPDATE TO authenticated
  USING (true);

-- Políticas para ceo_checklist_itens
DROP POLICY IF EXISTS "Usuários podem ver itens" ON public.ceo_checklist_itens;
CREATE POLICY "Usuários podem ver itens"
  ON public.ceo_checklist_itens
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuários podem criar itens" ON public.ceo_checklist_itens;
CREATE POLICY "Usuários podem criar itens"
  ON public.ceo_checklist_itens
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar itens" ON public.ceo_checklist_itens;
CREATE POLICY "Usuários podem atualizar itens"
  ON public.ceo_checklist_itens
  FOR UPDATE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuários podem deletar itens" ON public.ceo_checklist_itens;
CREATE POLICY "Usuários podem deletar itens"
  ON public.ceo_checklist_itens
  FOR DELETE TO authenticated
  USING (true);

-- Políticas para ceo_checklist_mencoes
DROP POLICY IF EXISTS "Usuários podem ver menções" ON public.ceo_checklist_mencoes;
CREATE POLICY "Usuários podem ver menções"
  ON public.ceo_checklist_mencoes
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuários podem criar menções" ON public.ceo_checklist_mencoes;
CREATE POLICY "Usuários podem criar menções"
  ON public.ceo_checklist_mencoes
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar suas menções" ON public.ceo_checklist_mencoes;
CREATE POLICY "Usuários podem atualizar suas menções"
  ON public.ceo_checklist_mencoes
  FOR UPDATE TO authenticated
  USING (true);

-- ============================================================================
-- TRIGGER: Atualizar updated_at do checklist
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_ceo_checklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ceo_checklist_updated_at ON public.ceo_checklist_diario;
CREATE TRIGGER tr_ceo_checklist_updated_at
  BEFORE UPDATE ON public.ceo_checklist_diario
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ceo_checklist_updated_at();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE public.ceo_checklist_diario IS 'Checklist diário do CEO/Founder';
COMMENT ON TABLE public.ceo_checklist_itens IS 'Itens do checklist diário com suporte a menções';
COMMENT ON TABLE public.ceo_checklist_mencoes IS 'Registro de menções (@) em itens do checklist';
COMMENT ON COLUMN public.ceo_checklist_itens.fonte IS 'Origem do item: manual, mencao, automatico, recorrente';
COMMENT ON COLUMN public.ceo_checklist_itens.criado_por IS 'UUID do usuário que criou o item (para menções)';
