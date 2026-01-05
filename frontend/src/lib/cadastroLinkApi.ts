// src/lib/cadastroLinkApi.ts
// API para sistema de cadastro por link

import { supabase } from "./supabaseClient";

// URL base do sistema em produção
const PRODUCTION_URL = "https://easy.wgalmeida.com.br";

// Função para obter a URL base correta
function getBaseUrl(): string {
  // Em produção, sempre usar o domínio oficial
  if (import.meta.env.PROD) {
    return PRODUCTION_URL;
  }
  // Em desenvolvimento, usar a URL atual
  return window.location.origin;
}

// ============================================================
// TIPOS
// ============================================================

export type TipoCadastro = "CLIENTE" | "COLABORADOR" | "FORNECEDOR" | "ESPECIFICADOR";

export type StatusCadastro = "aguardando_preenchimento" | "pendente_aprovacao" | "aprovado" | "rejeitado";

export interface CadastroPendente {
  id: string;
  token: string;
  tipo_solicitado: TipoCadastro;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cpf_cnpj: string | null;
  empresa: string | null;
  cargo: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  observacoes: string | null;
  status: StatusCadastro;
  enviado_por: string | null;
  enviado_via: "email" | "whatsapp" | null;
  aprovado_por: string | null;
  aprovado_em: string | null;
  tipo_usuario_aprovado: string | null;
  motivo_rejeicao: string | null;
  pessoa_id: string | null;
  usuario_id: string | null;
  nucleo_id: string | null;
  criado_em: string;
  atualizado_em: string;
  preenchido_em: string | null;
  expira_em: string;
  // Campos para links reutilizáveis
  reutilizavel?: boolean;
  uso_maximo?: number | null;
  total_usos?: number;
  link_pai_id?: string | null;
  // Dados bancários
  banco?: string | null;
  agencia?: string | null;
  conta?: string | null;
  tipo_conta?: string | null;
  pix?: string | null;
  // Da view
  enviado_por_nome?: string;
  enviado_por_tipo?: string;
  // Título personalizado da página
  titulo_pagina?: string | null;
}

export interface NotificacaoSistema {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  referencia_tipo: string | null;
  referencia_id: string | null;
  destinatario_id: string | null;
  para_todos_admins: boolean;
  lida: boolean;
  lida_em: string | null;
  url_acao: string | null;
  texto_acao: string | null;
  criado_em: string;
  nucleo_id: string | null;
}

export interface DadosCadastroPublico {
  nome: string;
  email: string;
  telefone?: string;
  cpf_cnpj?: string;
  empresa?: string;
  cargo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  // Dados bancários (para Colaborador e Fornecedor)
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: string;
  pix?: string;
}

// ============================================================
// TIPOS - COMISSIONAMENTO
// ============================================================

export interface CategoriaComissao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo_pessoa: "VENDEDOR" | "ESPECIFICADOR" | "COLABORADOR" | "EQUIPE_INTERNA";
  is_master: boolean;
  is_indicacao: boolean;
  ordem: number;
  ativo: boolean;
}

export interface FaixaVGV {
  id: string;
  cota: number;
  nome: string;
  valor_minimo: number;
  valor_maximo: number | null;
  descricao: string | null;
  ativo: boolean;
}

export interface PercentualComissao {
  id: string;
  categoria_id: string;
  faixa_id: string;
  percentual: number;
  ativo: boolean;
}

export interface TabelaComissaoItem {
  categoria_id: string;
  codigo: string;
  categoria_nome: string;
  tipo_pessoa: string;
  is_master: boolean;
  is_indicacao: boolean;
  ordem: number;
  faixa_id: string;
  cota: number;
  faixa_nome: string;
  valor_minimo: number;
  valor_maximo: number | null;
  percentual: number;
}

export interface EspecificadorMaster {
  id: string;
  nome: string;
  email: string | null;
  tipo: string;
}

// ============================================================
// FUNÇÕES - CRIAR E GERENCIAR LINKS
// ============================================================

export interface CriarLinkParams {
  tipo: TipoCadastro;
  enviadoVia?: "email" | "whatsapp";
  nucleoId?: string;
  reutilizavel?: boolean;
  usoMaximo?: number | null;
  expiraDias?: number;
  pessoaVinculadaId?: string; // ID da pessoa vinculada ao link
  descricaoLink?: string; // Descrição personalizada do link
  tituloPagina?: string; // Título personalizado exibido na página pública
}

export interface CriarLinkResult {
  id: string;
  token: string;
  url: string;
  expira_em: string;
  reutilizavel: boolean;
  pessoaVinculadaNome?: string;
}

/**
 * Cria um novo link de cadastro
 * @param params - Parâmetros para criação do link
 * @param params.tipo - Tipo de cadastro (CLIENTE, COLABORADOR, FORNECEDOR, ESPECIFICADOR)
 * @param params.reutilizavel - Se true, permite que o link seja usado por múltiplas pessoas
 * @param params.usoMaximo - Limite de usos do link (apenas se reutilizavel=true)
 * @param params.pessoaVinculadaId - ID da pessoa que está vinculada ao link (vendedor/colaborador/etc)
 */
export async function criarLinkCadastro(
  params: CriarLinkParams
): Promise<CriarLinkResult> {
  const {
    tipo,
    enviadoVia,
    nucleoId,
    reutilizavel = false,
    usoMaximo,
    expiraDias = 7,
    pessoaVinculadaId,
    descricaoLink,
    tituloPagina,
  } = params;

  // Pegar usuário atual
  const { data: { user } } = await supabase.auth.getUser();

  // Buscar usuario_id na tabela usuarios
  let usuarioId: string | null = null;
  if (user?.id) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    usuarioId = usuario?.id || null;
  }

  // Calcular data de expiração
  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + expiraDias);

  // Criar registro diretamente na tabela (para ter mais controle)
  const token = crypto.randomUUID();

  const { data: cadastro, error } = await supabase
    .from("cadastros_pendentes")
    .insert({
      token,
      tipo_solicitado: tipo,
      status: "aguardando_preenchimento",
      enviado_por: pessoaVinculadaId || usuarioId, // Se tiver pessoa vinculada, ela é quem "enviou"
      enviado_via: enviadoVia || null,
      nucleo_id: nucleoId || null,
      reutilizavel,
      uso_maximo: reutilizavel ? usoMaximo : null,
      expira_em: expiraEm.toISOString(),
      observacoes: descricaoLink || null,
      titulo_pagina: tituloPagina || null,
    })
    .select("id, token, expira_em, reutilizavel")
    .single();

  if (error) {
    console.error("Erro ao criar link:", error);
    throw new Error(error.message);
  }

  // Se tiver pessoa vinculada, buscar nome
  let pessoaVinculadaNome: string | undefined;
  if (pessoaVinculadaId) {
    const { data: pessoa } = await supabase
      .from("pessoas")
      .select("nome")
      .eq("id", pessoaVinculadaId)
      .single();
    pessoaVinculadaNome = pessoa?.nome;
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/cadastro/${cadastro.token}`;

  return {
    id: cadastro.id,
    token: cadastro.token,
    url,
    expira_em: cadastro.expira_em,
    reutilizavel: cadastro.reutilizavel || false,
    pessoaVinculadaNome,
  };
}

/**
 * Busca cadastro pelo token (para formulário público)
 */
export async function buscarCadastroPorToken(token: string): Promise<CadastroPendente | null> {
  const { data, error } = await supabase
    .from("cadastros_pendentes")
    .select("*")
    .eq("token", token)
    .single();

  if (error) {
    console.error("Erro ao buscar cadastro:", error);
    return null;
  }

  return data;
}

/**
 * Preenche o cadastro (formulário público)
 */
export async function preencherCadastro(
  token: string,
  dados: DadosCadastroPublico
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc("preencher_cadastro", {
    p_token: token,
    p_nome: dados.nome,
    p_email: dados.email,
    p_telefone: dados.telefone || null,
    p_cpf_cnpj: dados.cpf_cnpj || null,
    p_empresa: dados.empresa || null,
    p_cargo: dados.cargo || null,
    p_endereco: dados.endereco || null,
    p_cidade: dados.cidade || null,
    p_estado: dados.estado || null,
    p_cep: dados.cep || null,
    p_observacoes: dados.observacoes || null,
    p_banco: dados.banco || null,
    p_agencia: dados.agencia || null,
    p_conta: dados.conta || null,
    p_tipo_conta: dados.tipo_conta || null,
    p_pix: dados.pix || null,
  });

  if (error) {
    console.error("Erro ao preencher cadastro:", error);
    throw new Error(error.message);
  }

  return {
    success: data.success,
    message: data.message || data.error,
  };
}

// ============================================================
// FUNÇÕES - LISTAR E APROVAR CADASTROS
// ============================================================

/**
 * Lista cadastros pendentes de aprovação
 */
export async function listarCadastrosPendentes(params?: {
  status?: StatusCadastro;
  tipo?: TipoCadastro;
  nucleoId?: string;
}): Promise<CadastroPendente[]> {
  let query = supabase
    .from("vw_cadastros_pendentes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (params?.status) {
    query = query.eq("status", params.status);
  }

  if (params?.tipo) {
    query = query.eq("tipo_solicitado", params.tipo);
  }

  if (params?.nucleoId) {
    query = query.eq("nucleo_id", params.nucleoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao listar cadastros:", error);
    throw error;
  }

  return data || [];
}

/**
 * Aprova um cadastro pendente
 * @param isMaster - Se true, marca como Master (cadastro direto pela WG)
 * @param indicadoPorId - ID da pessoa que indicou (se for indicado por um Master)
 * @param categoriaComissaoId - ID da categoria de comissão (opcional, calculado automaticamente se não fornecido)
 */
export async function aprovarCadastro(
  cadastroId: string,
  tipoUsuario: string,
  options?: {
    isMaster?: boolean;
    indicadoPorId?: string;
    categoriaComissaoId?: string;
  }
): Promise<{
  success: boolean;
  pessoaId?: string;
  usuarioId?: string;
  email?: string;
  senhaTemporaria?: string;
  isMaster?: boolean;
  categoriaComissaoId?: string;
  message: string;
}> {
  // Pegar usuário atual
  const { data: { user } } = await supabase.auth.getUser();

  let aprovadoPor: string | null = null;
  if (user?.id) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    aprovadoPor = usuario?.id || null;
  }

  const { data, error } = await supabase.rpc("aprovar_cadastro", {
    p_cadastro_id: cadastroId,
    p_tipo_usuario: tipoUsuario,
    p_aprovado_por: aprovadoPor,
    p_is_master: options?.isMaster ?? null,
    p_indicado_por_id: options?.indicadoPorId ?? null,
    p_categoria_comissao_id: options?.categoriaComissaoId ?? null,
  });

  if (error) {
    console.error("Erro ao aprovar cadastro:", error);
    throw new Error(error.message);
  }

  return {
    success: data.success,
    pessoaId: data.pessoa_id,
    usuarioId: data.usuario_id,
    email: data.email,
    senhaTemporaria: data.senha_temporaria,
    isMaster: data.is_master,
    categoriaComissaoId: data.categoria_comissao_id,
    message: data.message || data.error,
  };
}

/**
 * Rejeita um cadastro pendente
 */
export async function rejeitarCadastro(
  cadastroId: string,
  motivo: string
): Promise<{ success: boolean; message: string }> {
  // Pegar usuário atual
  const { data: { user } } = await supabase.auth.getUser();

  let rejeitadoPor: string | null = null;
  if (user?.id) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    rejeitadoPor = usuario?.id || null;
  }

  const { data, error } = await supabase.rpc("rejeitar_cadastro", {
    p_cadastro_id: cadastroId,
    p_motivo: motivo,
    p_rejeitado_por: rejeitadoPor,
  });

  if (error) {
    console.error("Erro ao rejeitar cadastro:", error);
    throw new Error(error.message);
  }

  return {
    success: data.success,
    message: data.message || data.error,
  };
}

// ============================================================
// FUNÇÕES - NOTIFICAÇÕES
// ============================================================

/**
 * Lista notificações não lidas
 */
export async function listarNotificacoesNaoLidas(): Promise<NotificacaoSistema[]> {
  const { data, error } = await supabase
    .from("notificacoes_sistema")
    .select("*")
    .eq("lida", false)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar notificações:", error);
    return [];
  }

  return data || [];
}

/**
 * Conta notificações não lidas
 */
export async function contarNotificacoesNaoLidas(): Promise<number> {
  const { count, error } = await supabase
    .from("notificacoes_sistema")
    .select("*", { count: "exact", head: true })
    .eq("lida", false);

  if (error) {
    console.error("Erro ao contar notificações:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Marca notificação como lida
 */
export async function marcarNotificacaoComoLida(notificacaoId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  let lidaPor: string | null = null;
  if (user?.id) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    lidaPor = usuario?.id || null;
  }

  const { error } = await supabase
    .from("notificacoes_sistema")
    .update({
      lida: true,
      lida_em: new Date().toISOString(),
      lida_por: lidaPor,
    })
    .eq("id", notificacaoId);

  if (error) {
    console.error("Erro ao marcar notificação:", error);
  }
}

/**
 * Marca todas notificações como lidas
 */
export async function marcarTodasNotificacoesComoLidas(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  let lidaPor: string | null = null;
  if (user?.id) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    lidaPor = usuario?.id || null;
  }

  const { error } = await supabase
    .from("notificacoes_sistema")
    .update({
      lida: true,
      lida_em: new Date().toISOString(),
      lida_por: lidaPor,
    })
    .eq("lida", false);

  if (error) {
    console.error("Erro ao marcar notificações:", error);
  }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Gera mensagem para WhatsApp (retorna texto puro, NÃO encodado)
 * IMPORTANTE: Sempre usa URL de produção para compartilhamento
 */
export function gerarMensagemWhatsApp(url: string, tipo: TipoCadastro): string {
  const tipoLabel = {
    CLIENTE: "Cliente",
    COLABORADOR: "Colaborador",
    FORNECEDOR: "Fornecedor",
    ESPECIFICADOR: "Especificador",
  }[tipo];

  // Garantir que a URL use produção (substituir localhost por produção)
  const urlProd = url.replace(/http:\/\/localhost:\d+/, PRODUCTION_URL);

  return (
    `Olá!\n\n` +
    `Você foi convidado a se cadastrar como *${tipoLabel}* no sistema WGEasy do Grupo WG Almeida.\n\n` +
    `Clique no link abaixo para preencher seu cadastro:\n${urlProd}\n\n` +
    `Este link expira em 7 dias.\n\n` +
    `Após o preenchimento, sua solicitação será analisada e você receberá as credenciais de acesso.`
  );
}

/**
 * Gera URL do WhatsApp com mensagem
 */
export function gerarUrlWhatsApp(mensagem: string, telefone?: string): string {
  const encoded = encodeURIComponent(mensagem);
  if (telefone) {
    // Remove caracteres não numéricos do telefone
    const tel = telefone.replace(/\D/g, "");
    return `https://wa.me/${tel}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Gera link mailto para email
 * IMPORTANTE: Sempre usa URL de produção para compartilhamento
 */
export function gerarLinkEmail(url: string, tipo: TipoCadastro, email?: string): string {
  const tipoLabel = {
    CLIENTE: "Cliente",
    COLABORADOR: "Colaborador",
    FORNECEDOR: "Fornecedor",
    ESPECIFICADOR: "Especificador",
  }[tipo];

  // Garantir que a URL use produção
  const urlProd = url.replace(/http:\/\/localhost:\d+/, PRODUCTION_URL);

  const assunto = encodeURIComponent(`Convite para cadastro - Grupo WG Almeida`);
  const corpo = encodeURIComponent(
    `Olá!\n\n` +
    `Você foi convidado a se cadastrar como ${tipoLabel} no sistema WGEasy do Grupo WG Almeida.\n\n` +
    `Clique no link abaixo para preencher seu cadastro:\n${urlProd}\n\n` +
    `Este link expira em 7 dias.\n\n` +
    `Após o preenchimento, sua solicitação será analisada e você receberá as credenciais de acesso.\n\n` +
    `Atenciosamente,\nEquipe WG Almeida`
  );

  return `mailto:${email || ""}?subject=${assunto}&body=${corpo}`;
}

/**
 * Retorna label do tipo de cadastro
 */
export function getLabelTipoCadastro(tipo: TipoCadastro): string {
  return {
    CLIENTE: "Cliente",
    COLABORADOR: "Colaborador",
    FORNECEDOR: "Fornecedor",
    ESPECIFICADOR: "Especificador",
  }[tipo];
}

/**
 * Retorna cor do badge para status
 */
export function getCorStatusCadastro(status: StatusCadastro): string {
  return {
    aguardando_preenchimento: "gray",
    pendente_aprovacao: "yellow",
    aprovado: "green",
    rejeitado: "red",
  }[status];
}

/**
 * Retorna label do status
 */
export function getLabelStatusCadastro(status: StatusCadastro): string {
  return {
    aguardando_preenchimento: "Aguardando preenchimento",
    pendente_aprovacao: "Pendente de aprovação",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
  }[status];
}

// ============================================================
// FUNÇÕES - COMISSIONAMENTO
// ============================================================

/**
 * Lista especificadores/colaboradores Master (para dropdown de indicador)
 */
export async function listarEspecificadoresMaster(nucleoId?: string): Promise<EspecificadorMaster[]> {
  const { data, error } = await supabase.rpc("listar_especificadores_master", {
    p_nucleo_id: nucleoId || null,
  });

  if (error) {
    console.error("Erro ao listar masters:", error);
    return [];
  }

  return data || [];
}

/**
 * Lista categorias de comissão
 */
export async function listarCategoriasComissao(): Promise<CategoriaComissao[]> {
  const { data, error } = await supabase
    .from("categorias_comissao")
    .select("*")
    .eq("ativo", true)
    .order("ordem");

  if (error) {
    console.error("Erro ao listar categorias:", error);
    return [];
  }

  return data || [];
}

/**
 * Lista faixas de VGV
 */
export async function listarFaixasVGV(): Promise<FaixaVGV[]> {
  const { data, error } = await supabase
    .from("faixas_vgv")
    .select("*")
    .eq("ativo", true)
    .order("cota");

  if (error) {
    console.error("Erro ao listar faixas:", error);
    return [];
  }

  return data || [];
}

/**
 * Lista tabela completa de comissões (view)
 */
export async function listarTabelaComissoes(): Promise<TabelaComissaoItem[]> {
  const { data, error } = await supabase
    .from("vw_tabela_comissoes")
    .select("*")
    .order("ordem")
    .order("cota");

  if (error) {
    console.error("Erro ao listar tabela de comissões:", error);
    return [];
  }

  return data || [];
}

/**
 * Atualiza percentual de comissão
 */
export async function atualizarPercentualComissao(
  categoriaId: string,
  faixaId: string,
  percentual: number
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase
    .from("percentuais_comissao")
    .upsert(
      {
        categoria_id: categoriaId,
        faixa_id: faixaId,
        percentual,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "categoria_id,faixa_id" }
    );

  if (error) {
    console.error("Erro ao atualizar percentual:", error);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Percentual atualizado com sucesso!" };
}

/**
 * Adiciona nova faixa de VGV
 */
export async function adicionarFaixaVGV(faixa: {
  cota: number;
  nome: string;
  valor_minimo: number;
  valor_maximo?: number;
  descricao?: string;
}): Promise<{ success: boolean; message: string; id?: string }> {
  const { data, error } = await supabase
    .from("faixas_vgv")
    .insert(faixa)
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao adicionar faixa:", error);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Faixa adicionada!", id: data?.id };
}

/**
 * Atualiza faixa de VGV
 */
export async function atualizarFaixaVGV(
  faixaId: string,
  faixa: Partial<FaixaVGV>
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from("faixas_vgv")
    .update({ ...faixa, atualizado_em: new Date().toISOString() })
    .eq("id", faixaId);

  if (error) {
    console.error("Erro ao atualizar faixa:", error);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Faixa atualizada!" };
}

/**
 * Calcula comissão para um valor de venda
 */
export async function calcularComissao(
  valorVenda: number,
  categoriaId: string
): Promise<{
  faixaId: string;
  faixaNome: string;
  percentual: number;
  valorComissao: number;
} | null> {
  const { data, error } = await supabase.rpc("calcular_comissao", {
    p_valor_venda: valorVenda,
    p_categoria_id: categoriaId,
  });

  if (error || !data || data.length === 0) {
    console.error("Erro ao calcular comissão:", error);
    return null;
  }

  return {
    faixaId: data[0].faixa_id,
    faixaNome: data[0].faixa_nome,
    percentual: data[0].percentual,
    valorComissao: data[0].valor_comissao,
  };
}

/**
 * Lista indicados de um Master específico
 */
export async function listarIndicadosPorMaster(masterId: string): Promise<{
  id: string;
  nome: string;
  email: string;
  tipo: string;
  categoria_nome: string;
  data_inicio: string;
}[]> {
  const { data, error } = await supabase.rpc("listar_indicados_por_master", {
    p_master_id: masterId,
  });

  if (error) {
    console.error("Erro ao listar indicados:", error);
    return [];
  }

  return data || [];
}
