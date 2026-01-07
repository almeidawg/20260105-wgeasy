-- ============================================================================
-- MIGRAÇÃO: Sistema de Comentários e Menções (@)
-- Data: 2026-01-07
-- Descrição: Cria tabelas para comentários de tasks com suporte a menções
-- ============================================================================

-- ============================================================================
-- TABELA: project_tasks_comentarios
-- Armazena comentários de tasks do cronograma
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_tasks_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  usuario_nome TEXT NOT NULL DEFAULT 'Usuário',
  usuario_avatar TEXT,
  comentario TEXT NOT NULL,
  mencoes TEXT[] DEFAULT '{}', -- IDs de usuários mencionados
  editado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK opcional para project_tasks
DO $$
BEGIN
  IF to_regclass('public.project_tasks') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'fk_comentarios_task'
        AND conrelid = 'public.project_tasks_comentarios'::regclass
    ) THEN
      ALTER TABLE public.project_tasks_comentarios
        ADD CONSTRAINT fk_comentarios_task
        FOREIGN KEY (task_id)
        REFERENCES public.project_tasks(id)
        ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comentarios_task_id
  ON public.project_tasks_comentarios(task_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_id
  ON public.project_tasks_comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at
  ON public.project_tasks_comentarios(created_at DESC);

-- ============================================================================
-- TABELA: comentarios_notificacoes
-- Notificações para menções em comentários
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comentarios_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comentario_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- FK para comentários
  CONSTRAINT fk_notificacoes_comentario
    FOREIGN KEY (comentario_id)
    REFERENCES public.project_tasks_comentarios(id)
    ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id
  ON public.comentarios_notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida
  ON public.comentarios_notificacoes(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at
  ON public.comentarios_notificacoes(created_at DESC);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.project_tasks_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para comentários
CREATE POLICY "Usuários autenticados podem ver comentários"
  ON public.project_tasks_comentarios
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar comentários"
  ON public.project_tasks_comentarios
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autores podem atualizar seus comentários"
  ON public.project_tasks_comentarios
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Autores podem deletar seus comentários"
  ON public.project_tasks_comentarios
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas para notificações
CREATE POLICY "Usuários podem ver suas notificações"
  ON public.comentarios_notificacoes
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações"
  ON public.comentarios_notificacoes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas notificações"
  ON public.comentarios_notificacoes
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());

-- ============================================================================
-- TRIGGER: Atualizar updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_comentarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_comentarios_updated_at
  ON public.project_tasks_comentarios;
CREATE TRIGGER tr_comentarios_updated_at
  BEFORE UPDATE ON public.project_tasks_comentarios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_comentarios_updated_at();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE public.project_tasks_comentarios IS 'Comentários de tasks do cronograma com suporte a menções @';
COMMENT ON TABLE public.comentarios_notificacoes IS 'Notificações de menções em comentários';
COMMENT ON COLUMN public.project_tasks_comentarios.mencoes IS 'Array de UUIDs dos usuários mencionados no comentário';
