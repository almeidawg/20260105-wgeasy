// src/types/usuarios.ts
// Tipos centralizados para o módulo de usuários

export type TipoUsuario =
  | "MASTER"
  | "ADMIN"
  | "COMERCIAL"
  | "ATENDIMENTO"
  | "COLABORADOR"
  | "CLIENTE"
  | "ESPECIFICADOR"
  | "FORNECEDOR"
  | "JURIDICO"
  | "FINANCEIRO";

export interface Usuario {
  id: string;
  auth_user_id: string | null;
  pessoa_id: string;
  cpf: string;
  tipo_usuario: TipoUsuario;
  ativo: boolean;
  primeiro_acesso: boolean;
  nucleo_id: string | null;

  // Permissões do cliente
  cliente_pode_ver_valores: boolean;
  cliente_pode_ver_cronograma: boolean;
  cliente_pode_ver_documentos: boolean;
  cliente_pode_ver_proposta: boolean;
  cliente_pode_ver_contratos: boolean;
  cliente_pode_fazer_upload: boolean;
  cliente_pode_comentar: boolean;

  // Dados de contato
  telefone_whatsapp: string | null;
  email_contato: string | null;

  // Auditoria
  criado_em: string;
  atualizado_em: string;
  ultimo_acesso: string | null;
}

export interface UsuarioCompleto extends Usuario {
  // Dados da pessoa
  nome: string;
  email: string | null;
  telefone: string | null;
  tipo_pessoa: string;
  cargo: string | null;
  empresa: string | null;
  avatar_url: string | null;
}

export interface CriarUsuarioInput {
  cpf: string;
  tipo_usuario?: TipoUsuario;
  nucleo_id?: string | null;
}

export interface CriarUsuarioResponse {
  usuario_id: string;
  senha_temporaria: string;
  mensagem: string;
}

export interface PermissoesCliente {
  cliente_pode_ver_valores?: boolean;
  cliente_pode_ver_cronograma?: boolean;
  cliente_pode_ver_documentos?: boolean;
  cliente_pode_ver_proposta?: boolean;
  cliente_pode_ver_contratos?: boolean;
  cliente_pode_fazer_upload?: boolean;
  cliente_pode_comentar?: boolean;
}
