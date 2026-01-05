-- ============================================================
-- MIGRAÇÃO: Diário de Obra + Campo data_inicio_wg
-- Data: 2026-01-05
-- Descrição: Cria estrutura para diário de obra com integração
--            Google Drive e adiciona campo data_inicio_wg
-- ============================================================

-- 1. Adicionar campo data_inicio_wg na tabela pessoas
-- Este campo armazena a data de início na WG (para "Com a WG desde...")
ALTER TABLE pessoas
ADD COLUMN IF NOT EXISTS data_inicio_wg DATE;

COMMENT ON COLUMN pessoas.data_inicio_wg IS 'Data de início na WG - exibido como "Com a WG desde..."';

-- ============================================================
-- 2. Tabela principal do diário de obra
-- ============================================================
CREATE TABLE IF NOT EXISTS diario_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID REFERENCES oportunidades(id) ON DELETE CASCADE,
  colaborador_id UUID REFERENCES pessoas(id) ON DELETE SET NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE diario_obra IS 'Registros diários de obra feitos por colaboradores';
COMMENT ON COLUMN diario_obra.oportunidade_id IS 'Referência ao cliente/oportunidade';
COMMENT ON COLUMN diario_obra.colaborador_id IS 'Colaborador que criou o registro';
COMMENT ON COLUMN diario_obra.data IS 'Data do registro no diário';
COMMENT ON COLUMN diario_obra.descricao IS 'Comentário/descrição do dia';

-- ============================================================
-- 3. Tabela de fotos do diário de obra
-- ============================================================
CREATE TABLE IF NOT EXISTS diario_obra_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diario_id UUID REFERENCES diario_obra(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL,
  drive_file_id TEXT,
  drive_pasta_id TEXT,
  legenda TEXT,
  ordem INT DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE diario_obra_fotos IS 'Fotos do diário de obra - sem limite de quantidade';
COMMENT ON COLUMN diario_obra_fotos.arquivo_url IS 'URL do arquivo no Supabase Storage';
COMMENT ON COLUMN diario_obra_fotos.drive_file_id IS 'ID do arquivo no Google Drive';
COMMENT ON COLUMN diario_obra_fotos.drive_pasta_id IS 'ID da pasta no Google Drive';
COMMENT ON COLUMN diario_obra_fotos.legenda IS 'Legenda opcional da foto';
COMMENT ON COLUMN diario_obra_fotos.ordem IS 'Ordem de exibição da foto';

-- ============================================================
-- 4. Índices para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_diario_obra_oportunidade
  ON diario_obra(oportunidade_id);

CREATE INDEX IF NOT EXISTS idx_diario_obra_colaborador
  ON diario_obra(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_diario_obra_data
  ON diario_obra(data DESC);

CREATE INDEX IF NOT EXISTS idx_diario_obra_fotos_diario
  ON diario_obra_fotos(diario_id);

-- ============================================================
-- 5. Trigger para atualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_diario_obra_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_diario_obra_updated_at ON diario_obra;
CREATE TRIGGER trigger_diario_obra_updated_at
  BEFORE UPDATE ON diario_obra
  FOR EACH ROW
  EXECUTE FUNCTION update_diario_obra_updated_at();

-- ============================================================
-- 6. Políticas RLS (Row Level Security)
-- ============================================================

-- Habilitar RLS nas tabelas
ALTER TABLE diario_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_obra_fotos ENABLE ROW LEVEL SECURITY;

-- Política: Colaboradores podem ver e editar apenas seus próprios registros
CREATE POLICY diario_obra_colaborador_policy ON diario_obra
  FOR ALL
  USING (
    colaborador_id IN (
      SELECT pessoa_id FROM usuarios
      WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND tipo_usuario IN ('MASTER', 'ADMIN')
    )
  );

-- Política: Fotos seguem a mesma regra do diário
CREATE POLICY diario_obra_fotos_policy ON diario_obra_fotos
  FOR ALL
  USING (
    diario_id IN (
      SELECT id FROM diario_obra
      WHERE colaborador_id IN (
        SELECT pessoa_id FROM usuarios
        WHERE auth_user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND tipo_usuario IN ('MASTER', 'ADMIN')
    )
  );

-- Política: Clientes podem ver diários de suas oportunidades
CREATE POLICY diario_obra_cliente_view_policy ON diario_obra
  FOR SELECT
  USING (
    oportunidade_id IN (
      SELECT id FROM oportunidades
      WHERE cliente_id IN (
        SELECT pessoa_id FROM usuarios
        WHERE auth_user_id = auth.uid()
        AND tipo_usuario = 'CLIENTE'
      )
    )
  );

CREATE POLICY diario_obra_fotos_cliente_view_policy ON diario_obra_fotos
  FOR SELECT
  USING (
    diario_id IN (
      SELECT d.id FROM diario_obra d
      JOIN oportunidades o ON d.oportunidade_id = o.id
      WHERE o.cliente_id IN (
        SELECT pessoa_id FROM usuarios
        WHERE auth_user_id = auth.uid()
        AND tipo_usuario = 'CLIENTE'
      )
    )
  );

-- ============================================================
-- 7. Storage bucket para fotos do diário
-- ============================================================
-- Nota: Executar no painel do Supabase ou via API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('diario-obra', 'diario-obra', true)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================
