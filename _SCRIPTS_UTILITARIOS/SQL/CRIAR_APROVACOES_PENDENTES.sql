-- =====================================================
-- CRIAR TABELA DE APROVAÇÕES PENDENTES
-- Data: 2 de Janeiro, 2026
-- =====================================================

-- Tabela para armazenar requisições de novo usuário aguardando aprovação
CREATE TABLE IF NOT EXISTS solicitacoes_cadastro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados do solicitante
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT,
  telefone TEXT,
  tipo_usuario TEXT NOT NULL DEFAULT 'CLIENTE',

  -- Status
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  -- PENDENTE: Aguardando aprovação
  -- APROVADO: Admin aprovou, usuário pode fazer login
  -- REJEITADO: Admin rejeitou

  -- Dados de auditoria
  criado_em TIMESTAMP DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),

  aprovado_em TIMESTAMP,
  aprovado_por UUID REFERENCES auth.users(id),

  motivo_rejeicao TEXT,
  rejeitado_em TIMESTAMP,
  rejeitado_por UUID REFERENCES auth.users(id),

  -- Notificações enviadas
  email_enviado BOOLEAN DEFAULT false,
  email_enviado_em TIMESTAMP,
  notificacao_admin_enviada BOOLEAN DEFAULT false,
  notificacao_admin_enviada_em TIMESTAMP,

  -- Índices para performance
  CONSTRAINT status_valido CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_cadastro(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_email ON solicitacoes_cadastro(email);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_criado_em ON solicitacoes_cadastro(criado_em DESC);

-- Tabela de notificações do sistema para admin
CREATE TABLE IF NOT EXISTS notificacoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  -- NOVO_CADASTRO_PENDENTE: Novo usuário aguardando aprovação
  -- CADASTRO_APROVADO: Notificar solicitante que foi aprovado
  -- CADASTRO_REJEITADO: Notificar solicitante que foi rejeitado

  titulo TEXT NOT NULL,
  descricao TEXT,
  referencia_id UUID,
  referencia_tipo TEXT,
  -- SOLICITACAO_CADASTRO: referencia_id aponta para solicitacoes_cadastro.id

  lido BOOLEAN DEFAULT false,
  lido_em TIMESTAMP,

  criado_em TIMESTAMP DEFAULT now(),

  CONSTRAINT tipo_valido CHECK (tipo IN ('NOVO_CADASTRO_PENDENTE', 'CADASTRO_APROVADO', 'CADASTRO_REJEITADO'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes_sistema(usuario_id, lido);
CREATE INDEX IF NOT EXISTS idx_notificacoes_criado_em ON notificacoes_sistema(criado_em DESC);

-- RLS Policies
ALTER TABLE solicitacoes_cadastro ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para solicitacoes_cadastro
-- Qualquer um pode criar (INSERT)
CREATE POLICY "anyone_can_create_solicitacao" ON solicitacoes_cadastro
  FOR INSERT
  WITH CHECK (true);

-- Apenas MASTER/ADMIN podem VER (SELECT)
CREATE POLICY "admin_can_view_solicitacoes" ON solicitacoes_cadastro
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND tipo_usuario IN ('MASTER', 'ADMIN')
    )
  );

-- Apenas MASTER/ADMIN podem ATUALIZAR (UPDATE)
CREATE POLICY "admin_can_update_solicitacoes" ON solicitacoes_cadastro
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND tipo_usuario IN ('MASTER', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND tipo_usuario IN ('MASTER', 'ADMIN')
    )
  );

-- Políticas para notificacoes_sistema
-- Sistema pode inserir notificações
CREATE POLICY "system_can_insert_notifications" ON notificacoes_sistema
  FOR INSERT
  WITH CHECK (true);

-- Usuário vê suas próprias notificações
CREATE POLICY "user_can_view_own_notifications" ON notificacoes_sistema
  FOR SELECT
  USING (
    usuario_id = (
      SELECT id FROM usuarios
      WHERE auth_user_id = auth.uid()
    )
  );

-- Usuário pode atualizar suas notificações
CREATE POLICY "user_can_update_own_notifications" ON notificacoes_sistema
  FOR UPDATE
  USING (
    usuario_id = (
      SELECT id FROM usuarios
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    usuario_id = (
      SELECT id FROM usuarios
      WHERE auth_user_id = auth.uid()
    )
  );

-- =====================================================
-- VERIFICAR
-- =====================================================

-- Ver tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('solicitacoes_cadastro', 'notificacoes_sistema');

-- Ver índices
SELECT indexname FROM pg_indexes
WHERE tablename IN ('solicitacoes_cadastro', 'notificacoes_sistema');

-- Ver policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('solicitacoes_cadastro', 'notificacoes_sistema');
