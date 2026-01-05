import { supabase } from "./supabase";

// =============================================
// TIPOS DE DADOS
// =============================================

export type TipoSolicitante = "CLIENTE" | "COLABORADOR" | "FORNECEDOR";
export type TipoProcesso =
  | "TRABALHISTA"
  | "CLIENTE_CONTRA_EMPRESA"
  | "EMPRESA_CONTRA_CLIENTE"
  | "INTERMEDIACAO"
  | "OUTRO";
export type StatusAssistencia =
  | "PENDENTE"
  | "EM_ANALISE"
  | "EM_ANDAMENTO"
  | "RESOLVIDO"
  | "ARQUIVADO";
export type Prioridade = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export type TipoLancamento =
  | "HONORARIO"
  | "CUSTAS"
  | "TAXA"
  | "ACORDO"
  | "MULTA"
  | "OUTROS"
  | "MENSALIDADE";
export type Natureza = "RECEITA" | "DESPESA";
export type StatusFinanceiro =
  | "PENDENTE"
  | "PAGO"
  | "PARCIAL"
  | "CANCELADO"
  | "ATRASADO";

export interface AssistenciaJuridica {
  id: string;
  tipo_solicitante: TipoSolicitante;
  solicitante_id: string;
  tipo_processo: TipoProcesso;
  titulo: string;
  descricao: string | null;
  status: StatusAssistencia;
  prioridade: Prioridade;
  numero_processo: string | null;
  vara: string | null;
  comarca: string | null;
  advogado_responsavel: string | null;
  valor_causa: number;
  valor_acordo: number | null;
  data_abertura: string;
  data_audiencia: string | null;
  data_encerramento: string | null;
  observacoes: string | null;
  criado_por: string | null;
  atualizado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceiroJuridico {
  id: string;
  assistencia_id: string | null;
  contrato_id: string | null;
  tipo: TipoLancamento;
  natureza: Natureza;
  descricao: string;
  observacoes: string | null;
  valor: number;
  valor_pago: number;
  data_competencia: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusFinanceiro;
  parcela_atual: number;
  total_parcelas: number;
  pessoa_id: string | null;
  empresa_id: string | null;
  sincronizado_financeiro: boolean;
  financeiro_lancamento_id: string | null;
  criado_por: string | null;
  atualizado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceiroJuridicoDetalhado extends FinanceiroJuridico {
  pessoa_nome: string | null;
  pessoa_tipo: string | null;
  pessoa_cpf: string | null;
  pessoa_cnpj: string | null;
  empresa_nome: string | null;
  assistencia_titulo: string | null;
  numero_processo: string | null;
  contrato_numero: string | null;
  dias_atraso: number;
}

export interface PaginationParams {
  pageSize?: number;
  offset?: number;
}

export interface FilterParams {
  status?: StatusAssistencia;
  prioridade?: Prioridade;
  tipo_processo?: TipoProcesso;
  tipo_solicitante?: TipoSolicitante;
  busca?: string;
}

export interface FinanceiroFilterParams {
  status?: StatusFinanceiro;
  tipo?: TipoLancamento;
  natureza?: Natureza;
  mes?: string;
  busca?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// =============================================
// ASSISTENCIA JURIDICA - CRUD
// =============================================

export async function listarAssistencias(
  pagination: PaginationParams = {},
  filters: FilterParams = {},
  sort: SortParams = {}
) {
  const { pageSize = 10, offset = 0 } = pagination;
  const { status, prioridade, tipo_processo, tipo_solicitante, busca } =
    filters;
  const { sortBy = "data_abertura", sortOrder = "desc" } = sort;

  let query = supabase
    .from("assistencia_juridica")
    .select("*", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (prioridade) query = query.eq("prioridade", prioridade);
  if (tipo_processo) query = query.eq("tipo_processo", tipo_processo);
  if (tipo_solicitante) query = query.eq("tipo_solicitante", tipo_solicitante);

  if (busca) {
    query = query.or(
      `titulo.ilike.%${busca}%,descricao.ilike.%${busca}%,numero_processo.ilike.%${busca}%`
    );
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data as AssistenciaJuridica[],
    count: count || 0,
    pageSize,
    offset,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: Math.floor(offset / pageSize) + 1,
  };
}

export async function obterAssistencia(id: string) {
  const { data, error } = await supabase
    .from("assistencia_juridica")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as AssistenciaJuridica;
}

export async function criarAssistencia(
  dados: Omit<AssistenciaJuridica, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("assistencia_juridica")
    .insert([dados])
    .select()
    .single();

  if (error) throw error;
  return data as AssistenciaJuridica;
}

export async function atualizarAssistencia(
  id: string,
  dados: Partial<Omit<AssistenciaJuridica, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("assistencia_juridica")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AssistenciaJuridica;
}

export async function deletarAssistencia(id: string) {
  const { error } = await supabase
    .from("assistencia_juridica")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// =============================================
// FINANCEIRO JURIDICO - CRUD
// =============================================

export async function listarFinanceiroJuridico(
  pagination: PaginationParams = {},
  filters: FinanceiroFilterParams = {},
  sort: SortParams = {}
) {
  const { pageSize = 10, offset = 0 } = pagination;
  const { status, tipo, natureza, mes, busca } = filters;
  const { sortBy = "data_vencimento", sortOrder = "desc" } = sort;

  let query = supabase
    .from("vw_financeiro_juridico_detalhado")
    .select("*", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (tipo) query = query.eq("tipo", tipo);
  if (natureza) query = query.eq("natureza", natureza);

  if (mes) {
    const [ano, mês] = mes.split("-");
    query = query.gte("data_competencia", `${ano}-${mês}-01`);
    query = query.lt("data_competencia", `${ano}-${parseInt(mês) + 1}-01`);
  }

  if (busca) {
    query = query.or(
      `descricao.ilike.%${busca}%,observacoes.ilike.%${busca}%,pessoa_nome.ilike.%${busca}%,assistencia_titulo.ilike.%${busca}%`
    );
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data as FinanceiroJuridicoDetalhado[],
    count: count || 0,
    pageSize,
    offset,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: Math.floor(offset / pageSize) + 1,
  };
}

export async function obterFinanceiroJuridico(id: string) {
  const { data, error } = await supabase
    .from("vw_financeiro_juridico_detalhado")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as FinanceiroJuridicoDetalhado;
}

export async function criarLancamentoJuridico(
  dados: Omit<
    FinanceiroJuridico,
    | "id"
    | "created_at"
    | "updated_at"
    | "sincronizado_financeiro"
    | "financeiro_lancamento_id"
  >
) {
  const { data, error } = await supabase
    .from("financeiro_juridico")
    .insert([
      {
        ...dados,
        sincronizado_financeiro: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as FinanceiroJuridico;
}

export async function atualizarLancamentoJuridico(
  id: string,
  dados: Partial<Omit<FinanceiroJuridico, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("financeiro_juridico")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FinanceiroJuridico;
}

export async function deletarLancamentoJuridico(id: string) {
  const { error } = await supabase
    .from("financeiro_juridico")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// =============================================
// VIEWS E RELATÓRIOS
// =============================================

export async function obterResumoFinanceiroJuridico() {
  const { data, error } = await supabase
    .from("vw_financeiro_juridico_resumo")
    .select("*")
    .order("mes", { ascending: false })
    .limit(12);

  if (error) throw error;
  return data;
}

export async function obterEstatisticasAssistencia() {
  const { data, error } = await supabase.rpc("get_juridico_statistics");

  if (error) {
    console.warn("Statistics function not available, returning null");
    return null;
  }

  return data;
}

// =============================================
// HISTORICO
// =============================================

export async function obterHistoricoAssistencia(assistencia_id: string) {
  const { data, error } = await supabase
    .from("assistencia_juridica_historico")
    .select("*")
    .eq("assistencia_id", assistencia_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function adicionarMovimentacaoHistorico(
  assistencia_id: string,
  tipo_movimentacao: string,
  descricao: string,
  usuario_id?: string,
  usuario_nome?: string
) {
  const { data, error } = await supabase
    .from("assistencia_juridica_historico")
    .insert([
      {
        assistencia_id,
        tipo_movimentacao,
        descricao,
        usuario_id,
        usuario_nome,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
