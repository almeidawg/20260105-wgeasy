-- ============================================================================
-- GOOGLE KEEP - COMPARTILHAMENTO DE NOTAS
-- Data: 2026-01-08
-- Permite compartilhar notas do Keep com clientes e usuarios internos
-- ============================================================================

-- Tabela de compartilhamentos
CREATE TABLE IF NOT EXISTS keep_notes_compartilhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificador da nota no Google Keep
  keep_note_id TEXT NOT NULL,

  -- Metadados da nota (cache para queries rapidas)
  titulo TEXT,
  criado_por_usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Compartilhar com (pessoa = cliente externo, usuario = interno)
  -- Uma linha por compartilhamento (ou pessoa OU usuario, nao ambos)
  compartilhado_com_pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
  compartilhado_com_usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Permissoes
  pode_editar BOOLEAN DEFAULT false,           -- Pode editar titulo/conteudo
  pode_marcar_itens BOOLEAN DEFAULT true,      -- Pode marcar/desmarcar itens
  pode_adicionar_itens BOOLEAN DEFAULT false,  -- Pode adicionar novos itens

  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_share_pessoa UNIQUE(keep_note_id, compartilhado_com_pessoa_id),
  CONSTRAINT unique_share_usuario UNIQUE(keep_note_id, compartilhado_com_usuario_id),
  CONSTRAINT must_have_target CHECK (
    (compartilhado_com_pessoa_id IS NOT NULL AND compartilhado_com_usuario_id IS NULL) OR
    (compartilhado_com_pessoa_id IS NULL AND compartilhado_com_usuario_id IS NOT NULL)
  )
);

-- Indices para busca rapida
CREATE INDEX IF NOT EXISTS idx_keep_share_note_id ON keep_notes_compartilhamentos(keep_note_id);
CREATE INDEX IF NOT EXISTS idx_keep_share_pessoa ON keep_notes_compartilhamentos(compartilhado_com_pessoa_id) WHERE compartilhado_com_pessoa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_keep_share_usuario ON keep_notes_compartilhamentos(compartilhado_com_usuario_id) WHERE compartilhado_com_usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_keep_share_criado_por ON keep_notes_compartilhamentos(criado_por_usuario_id);

-- RLS (Row Level Security)
ALTER TABLE keep_notes_compartilhamentos ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios autenticados podem ver compartilhamentos onde sao o alvo
CREATE POLICY "Usuarios podem ver seus compartilhamentos" ON keep_notes_compartilhamentos
  FOR SELECT
  USING (
    -- Usuario interno pode ver se foi compartilhado com ele
    compartilhado_com_usuario_id = auth.uid()
    OR
    -- Usuario interno pode ver se ele criou o compartilhamento
    criado_por_usuario_id = auth.uid()
    OR
    -- Cliente pode ver se foi compartilhado com sua pessoa
    compartilhado_com_pessoa_id IN (
      SELECT pessoa_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Politica: usuarios podem criar compartilhamentos
CREATE POLICY "Usuarios podem criar compartilhamentos" ON keep_notes_compartilhamentos
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Politica: usuarios podem deletar compartilhamentos que criaram
CREATE POLICY "Usuarios podem deletar seus compartilhamentos" ON keep_notes_compartilhamentos
  FOR DELETE
  USING (criado_por_usuario_id = auth.uid());

-- Politica: usuarios podem atualizar compartilhamentos que criaram
CREATE POLICY "Usuarios podem atualizar seus compartilhamentos" ON keep_notes_compartilhamentos
  FOR UPDATE
  USING (criado_por_usuario_id = auth.uid());

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_keep_compartilhamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_keep_compartilhamentos_updated_at
  BEFORE UPDATE ON keep_notes_compartilhamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_keep_compartilhamentos_updated_at();

-- Comentarios
COMMENT ON TABLE keep_notes_compartilhamentos IS 'Armazena compartilhamentos de notas do Google Keep com clientes e usuarios internos';
COMMENT ON COLUMN keep_notes_compartilhamentos.keep_note_id IS 'ID da nota no Google Keep (sem prefixo notes/)';
COMMENT ON COLUMN keep_notes_compartilhamentos.compartilhado_com_pessoa_id IS 'Cliente externo (da tabela pessoas)';
COMMENT ON COLUMN keep_notes_compartilhamentos.compartilhado_com_usuario_id IS 'Usuario interno do sistema';
COMMENT ON COLUMN keep_notes_compartilhamentos.pode_marcar_itens IS 'Permite marcar/desmarcar itens do checklist';
