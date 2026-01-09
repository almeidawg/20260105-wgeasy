-- ============================================================
-- Migration: Atualizar vw_usuarios_completo com google_workspace_email
-- Sistema WG Easy - Grupo WG Almeida
-- ============================================================
-- Adiciona o campo google_workspace_email na view para permitir
-- que cada usuário veja seus próprios dados de Calendar/Keep
-- ============================================================

-- Dropar view existente para poder alterar estrutura
DROP VIEW IF EXISTS vw_usuarios_completo;

-- Recriar a view com o campo google_workspace_email
CREATE VIEW vw_usuarios_completo AS
SELECT
  u.id,
  u.auth_user_id,
  u.pessoa_id,
  u.nucleo_id,
  u.tipo_usuario,
  u.ativo,
  u.criado_em,
  u.atualizado_em,
  u.ultimo_acesso,
  u.primeiro_acesso,
  -- Permissões de cliente
  u.cliente_pode_ver_valores,
  u.cliente_pode_ver_cronograma,
  u.cliente_pode_ver_documentos,
  u.cliente_pode_ver_proposta,
  u.cliente_pode_ver_contratos,
  u.cliente_pode_fazer_upload,
  u.cliente_pode_comentar,
  -- Google Workspace Email (novo campo)
  u.google_workspace_email,
  -- Campos de contato do usuario
  u.email_contato,
  u.telefone_whatsapp,
  -- Dados da pessoa
  p.nome,
  p.email,
  p.telefone,
  p.cpf,
  p.avatar_url,
  p.foto_url,
  p.cargo,
  p.empresa,
  p.tipo AS tipo_pessoa
FROM usuarios u
LEFT JOIN pessoas p ON u.pessoa_id = p.id;

-- Comentário explicativo
COMMENT ON VIEW vw_usuarios_completo IS 'View completa de usuários com dados da pessoa e google_workspace_email para integração Google';

-- Garantir permissões
GRANT SELECT ON vw_usuarios_completo TO authenticated;
GRANT SELECT ON vw_usuarios_completo TO anon;
