// src/hooks/usePermissoesUsuario.ts
// Hook para gerenciar permissões do usuário logado
// ATUALIZADO: Agora busca permissões REAIS do banco de dados via useUsuarioLogado

import { useUsuarioLogado } from "./useUsuarioLogado";

export interface PermissoesUsuario {
  // Tipo de usuário
  isAdmin: boolean;
  isMaster: boolean;
  isColaborador: boolean;
  isCliente: boolean;
  isEspecificador: boolean;
  isFornecedor: boolean;

  // Permissões gerais
  podeGerenciarUsuarios: boolean;
  podeAcessarTodasInformacoes: boolean;

  // Permissões específicas de cliente
  podeVerValores: boolean;
  podeVerCronograma: boolean;
  podeVerDocumentos: boolean;
  podeVerProposta: boolean;
  podeVerContratos: boolean;
  podeFazerUpload: boolean;
  podeComentarem: boolean;

  // Dados do usuário
  usuarioId: string | null;
  pessoaId: string | null;
  nome: string | null;
}

const permissoesVazias: PermissoesUsuario = {
  isAdmin: false,
  isMaster: false,
  isColaborador: false,
  isCliente: false,
  isEspecificador: false,
  isFornecedor: false,
  podeGerenciarUsuarios: false,
  podeAcessarTodasInformacoes: false,
  podeVerValores: false,
  podeVerCronograma: false,
  podeVerDocumentos: false,
  podeVerProposta: false,
  podeVerContratos: false,
  podeFazerUpload: false,
  podeComentarem: false,
  usuarioId: null,
  pessoaId: null,
  nome: null,
};

export function usePermissoesUsuario() {
  const {
    usuario,
    loading,
    isMaster,
    isAdmin,
    isColaborador,
    isCliente,
    isEspecificador,
    isFornecedor,
    isAdminOuMaster,
    isInterno,
    podeVerValores,
    podeVerCronograma,
    podeVerDocumentos,
    podeVerProposta,
    podeVerContratos,
    podeFazerUpload,
    podeComentarem,
  } = useUsuarioLogado();

  // Construir objeto de permissões baseado nos dados REAIS do banco
  const permissoes: PermissoesUsuario = usuario ? {
    isMaster,
    isAdmin,
    isColaborador,
    isCliente,
    isEspecificador,
    isFornecedor,
    // Permissões gerais baseadas no tipo de usuário
    podeGerenciarUsuarios: isAdminOuMaster,
    podeAcessarTodasInformacoes: isInterno,
    // Permissões específicas de cliente (do banco de dados)
    // Se for interno (admin/master/colaborador), tem acesso total
    // Se for cliente, usa as permissões específicas definidas no banco
    podeVerValores: isInterno || podeVerValores,
    podeVerCronograma: isInterno || podeVerCronograma,
    podeVerDocumentos: isInterno || podeVerDocumentos,
    podeVerProposta: isInterno || podeVerProposta,
    podeVerContratos: isInterno || podeVerContratos,
    podeFazerUpload: isInterno || podeFazerUpload,
    podeComentarem: isInterno || podeComentarem,
    // Dados do usuário
    usuarioId: usuario.id,
    pessoaId: usuario.pessoa_id,
    nome: usuario.nome,
  } : permissoesVazias;

  return {
    permissoes,
    loading,
    // Funções auxiliares
    podeAcessar: (recurso: keyof Omit<PermissoesUsuario, 'usuarioId' | 'pessoaId' | 'nome'>) => {
      return permissoes[recurso] === true;
    },
  };
}

// Hook específico para clientes
export function usePermissoesCliente() {
  const { permissoes, loading } = usePermissoesUsuario();

  return {
    podeVerValores: permissoes.podeVerValores,
    podeVerCronograma: permissoes.podeVerCronograma,
    podeVerDocumentos: permissoes.podeVerDocumentos,
    podeVerProposta: permissoes.podeVerProposta,
    podeVerContratos: permissoes.podeVerContratos,
    podeFazerUpload: permissoes.podeFazerUpload,
    podeComentarem: permissoes.podeComentarem,
    loading,
  };
}
