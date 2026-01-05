// ============================================================
// API: Lista de Compras (Workflow de Compras)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { supabase } from "@/lib/supabaseClient";

// ============================================================
// TIPOS
// ============================================================

export type TipoCompra = "WG_COMPRA" | "CLIENTE_DIRETO";
export type TipoConta = "REAL" | "VIRTUAL";
export type StatusCompra = "PENDENTE" | "APROVADO" | "COMPRADO" | "ENTREGUE" | "CANCELADO";
export type StatusProjeto = "EM_ANDAMENTO" | "PAUSADO" | "FINALIZADO" | "CANCELADO";

export interface CategoriaCompras {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  etapa_obra: string;
  ordem_execucao: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjetoCompras {
  id: string;
  codigo: string;
  contrato_id: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  nome: string;
  endereco: string | null;
  area_total: number | null;
  tipo_projeto: string | null;
  status: StatusProjeto;
  data_inicio: string | null;
  data_previsao: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjetoQuantitativo {
  id: string;
  codigo: string;
  projeto_id: string;
  ambiente: string;
  assunto: string;
  aplicacao: string | null;
  descricao_projeto: string;
  quantidade_projeto: number | null;
  unidade: string | null;
  fornecedor: string | null;
  fabricante: string | null;
  modelo: string | null;
  codigo_produto: string | null;
  quantidade_compra: number | null;
  observacoes: string | null;
  pricelist_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListaCompraItem {
  id: string;
  codigo: string;
  projeto_id: string;
  quantitativo_id: string | null;
  pricelist_id: string | null;
  categoria_id: string | null;
  ambiente: string | null;
  descricao: string;
  especificacao: string | null;
  quantidade_projeto: number | null;
  quantidade_compra: number | null;
  unidade: string | null;
  preco_unitario: number | null;
  valor_total: number | null;
  tipo_compra: TipoCompra;
  tipo_conta: TipoConta;
  taxa_fee_percent: number;
  valor_fee: number;
  fornecedor: string | null;
  link_produto: string | null;
  status: StatusCompra;
  data_aprovacao: string | null;
  data_compra: string | null;
  data_entrega: string | null;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  projeto?: ProjetoCompras;
  categoria?: CategoriaCompras;
}

export interface FluxoFinanceiroCompras {
  id: string;
  codigo: string;
  projeto_id: string | null;
  lista_compra_id: string | null;
  data_registro: string;
  cliente_nome: string | null;
  categoria: string | null;
  descricao: string | null;
  tipo_compra: TipoCompra;
  fornecedor: string | null;
  valor_bruto: number;
  taxa_fee_percent: number;
  valor_fee: number;
  valor_liquido: number | null;
  tipo_conta: TipoConta;
  status: StatusCompra;
  created_at: string;
  updated_at: string;
}

// ============================================================
// FORM DATA
// ============================================================

export interface ProjetoComprasFormData {
  codigo?: string;
  contrato_id?: string;
  cliente_id?: string;
  cliente_nome?: string;
  nome: string;
  endereco?: string;
  area_total?: number;
  tipo_projeto?: string;
  status?: StatusProjeto;
  data_inicio?: string;
  data_previsao?: string;
}

export interface ListaCompraFormData {
  codigo?: string;
  projeto_id: string;
  quantitativo_id?: string;
  pricelist_id?: string;
  categoria_id?: string;
  ambiente?: string;
  descricao: string;
  especificacao?: string;
  quantidade_projeto?: number;
  quantidade_compra?: number;
  unidade?: string;
  preco_unitario?: number;
  tipo_compra: TipoCompra;
  tipo_conta: TipoConta;
  taxa_fee_percent?: number;
  fornecedor?: string;
  link_produto?: string;
  status?: StatusCompra;
}

// ============================================================
// CATEGORIAS DE COMPRAS
// ============================================================

export async function listarCategoriasCompras(): Promise<CategoriaCompras[]> {
  const { data, error } = await supabase
    .from("categorias_compras")
    .select("*")
    .eq("ativo", true)
    .order("ordem_execucao", { ascending: true });

  if (error) throw error;
  return data as CategoriaCompras[];
}

export async function buscarCategoriaCompras(id: string): Promise<CategoriaCompras> {
  const { data, error } = await supabase
    .from("categorias_compras")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as CategoriaCompras;
}

// ============================================================
// PROJETOS DE COMPRAS
// ============================================================

export async function listarProjetosCompras(): Promise<ProjetoCompras[]> {
  const { data, error } = await supabase
    .from("projetos_compras")
    .select("*")
    .order("created_at", { ascending: false })
    .range(0, 49999);

  if (error) throw error;
  return data as ProjetoCompras[];
}

export async function buscarProjetoCompras(id: string): Promise<ProjetoCompras> {
  const { data, error } = await supabase
    .from("projetos_compras")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ProjetoCompras;
}

export async function criarProjetoCompras(payload: ProjetoComprasFormData): Promise<ProjetoCompras> {
  // Gerar codigo automatico se nao fornecido
  if (!payload.codigo) {
    const { data: ultimo } = await supabase
      .from("projetos_compras")
      .select("codigo")
      .order("created_at", { ascending: false })
      .limit(1);

    const proximoNum = ultimo && ultimo.length > 0
      ? parseInt(ultimo[0].codigo.replace("PC-", ""), 10) + 1
      : 1;
    payload.codigo = `PC-${proximoNum.toString().padStart(4, "0")}`;
  }

  const { data, error } = await supabase
    .from("projetos_compras")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as ProjetoCompras;
}

export async function atualizarProjetoCompras(
  id: string,
  payload: Partial<ProjetoComprasFormData>
): Promise<ProjetoCompras> {
  const { data, error } = await supabase
    .from("projetos_compras")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ProjetoCompras;
}

export async function deletarProjetoCompras(id: string): Promise<void> {
  const { error } = await supabase
    .from("projetos_compras")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============================================================
// QUANTITATIVO DO PROJETO
// ============================================================

export async function listarQuantitativosProjeto(projetoId: string): Promise<ProjetoQuantitativo[]> {
  const { data, error } = await supabase
    .from("projeto_quantitativo")
    .select("*")
    .eq("projeto_id", projetoId)
    .order("ambiente", { ascending: true });

  if (error) throw error;
  return data as ProjetoQuantitativo[];
}

// ============================================================
// LISTA DE COMPRAS
// ============================================================

export async function listarItensCompras(projetoId?: string): Promise<ListaCompraItem[]> {
  let query = supabase
    .from("projeto_lista_compras")
    .select(`
      *,
      projeto:projetos_compras(id, codigo, nome, cliente_nome),
      categoria:categorias_compras(id, codigo, nome, tipo)
    `)
    .order("created_at", { ascending: false })
    .range(0, 49999);

  if (projetoId) {
    query = query.eq("projeto_id", projetoId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ListaCompraItem[];
}

export async function buscarItemCompra(id: string): Promise<ListaCompraItem> {
  const { data, error } = await supabase
    .from("projeto_lista_compras")
    .select(`
      *,
      projeto:projetos_compras(id, codigo, nome, cliente_nome),
      categoria:categorias_compras(id, codigo, nome, tipo)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ListaCompraItem;
}

export async function criarItemCompra(payload: ListaCompraFormData): Promise<ListaCompraItem> {
  // Gerar codigo automatico
  if (!payload.codigo) {
    const { data: ultimo } = await supabase
      .from("projeto_lista_compras")
      .select("codigo")
      .order("created_at", { ascending: false })
      .limit(1);

    const proximoNum = ultimo && ultimo.length > 0
      ? parseInt(ultimo[0].codigo.replace("LC-", ""), 10) + 1
      : 1;
    payload.codigo = `LC-${proximoNum.toString().padStart(5, "0")}`;
  }

  // Calcular valores
  const quantidade = payload.quantidade_compra || payload.quantidade_projeto || 0;
  const precoUnit = payload.preco_unitario || 0;
  const valorTotal = quantidade * precoUnit;

  // Calcular FEE se for CLIENTE_DIRETO
  const taxaFee = payload.tipo_compra === "CLIENTE_DIRETO"
    ? (payload.taxa_fee_percent ?? 15)
    : 0;
  const valorFee = payload.tipo_compra === "CLIENTE_DIRETO"
    ? valorTotal * (taxaFee / 100)
    : 0;

  const insertData = {
    ...payload,
    valor_total: valorTotal,
    taxa_fee_percent: taxaFee,
    valor_fee: valorFee,
    status: payload.status || "PENDENTE",
  };

  const { data, error } = await supabase
    .from("projeto_lista_compras")
    .insert(insertData)
    .select(`
      *,
      projeto:projetos_compras(id, codigo, nome, cliente_nome),
      categoria:categorias_compras(id, codigo, nome, tipo)
    `)
    .single();

  if (error) throw error;
  return data as ListaCompraItem;
}

export async function atualizarItemCompra(
  id: string,
  payload: Partial<ListaCompraFormData>
): Promise<ListaCompraItem> {
  // Recalcular valores se houver mudanca de preco/quantidade
  const updateData: any = { ...payload };

  if (payload.quantidade_compra !== undefined || payload.preco_unitario !== undefined) {
    // Buscar item atual para valores nao fornecidos
    const { data: atual } = await supabase
      .from("projeto_lista_compras")
      .select("quantidade_compra, preco_unitario, tipo_compra, taxa_fee_percent")
      .eq("id", id)
      .single();

    if (atual) {
      const quantidade = payload.quantidade_compra ?? atual.quantidade_compra ?? 0;
      const preco = payload.preco_unitario ?? atual.preco_unitario ?? 0;
      const tipoCompra = payload.tipo_compra ?? atual.tipo_compra;
      const taxaFee = tipoCompra === "CLIENTE_DIRETO"
        ? (payload.taxa_fee_percent ?? atual.taxa_fee_percent ?? 15)
        : 0;

      updateData.valor_total = quantidade * preco;
      updateData.taxa_fee_percent = taxaFee;
      updateData.valor_fee = tipoCompra === "CLIENTE_DIRETO"
        ? updateData.valor_total * (taxaFee / 100)
        : 0;
    }
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("projeto_lista_compras")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      projeto:projetos_compras(id, codigo, nome, cliente_nome),
      categoria:categorias_compras(id, codigo, nome, tipo)
    `)
    .single();

  if (error) throw error;
  return data as ListaCompraItem;
}

export async function deletarItemCompra(id: string): Promise<void> {
  const { error } = await supabase
    .from("projeto_lista_compras")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function atualizarStatusCompra(
  id: string,
  status: StatusCompra
): Promise<ListaCompraItem> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Atualizar data conforme status
  if (status === "APROVADO") {
    updateData.data_aprovacao = new Date().toISOString();
  } else if (status === "COMPRADO") {
    updateData.data_compra = new Date().toISOString();
  } else if (status === "ENTREGUE") {
    updateData.data_entrega = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("projeto_lista_compras")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      projeto:projetos_compras(id, codigo, nome, cliente_nome),
      categoria:categorias_compras(id, codigo, nome, tipo)
    `)
    .single();

  if (error) throw error;
  return data as ListaCompraItem;
}

// ============================================================
// FLUXO FINANCEIRO
// ============================================================

export async function listarFluxoFinanceiro(projetoId?: string): Promise<FluxoFinanceiroCompras[]> {
  let query = supabase
    .from("fluxo_financeiro_compras")
    .select("*")
    .order("data_registro", { ascending: false })
    .range(0, 49999);

  if (projetoId) {
    query = query.eq("projeto_id", projetoId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as FluxoFinanceiroCompras[];
}

// ============================================================
// VIEWS E RESUMOS
// ============================================================

export interface ResumoFinanceiroCompras {
  projeto_id: string;
  projeto_nome: string;
  cliente_nome: string | null;
  total_itens: number;
  valor_wg_compra: number;
  valor_cliente_direto: number;
  total_fee: number;
  valor_conta_real: number;
  valor_conta_virtual: number;
}

export async function obterResumoFinanceiro(projetoId?: string): Promise<ResumoFinanceiroCompras[]> {
  let query = supabase
    .from("v_resumo_financeiro_compras")
    .select("*");

  if (projetoId) {
    query = query.eq("projeto_id", projetoId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ResumoFinanceiroCompras[];
}

export interface ListaCompraCompleta extends ListaCompraItem {
  projeto_codigo: string;
  projeto_nome: string;
  cliente_nome: string | null;
  categoria_codigo: string | null;
  categoria_nome: string | null;
}

export async function listarComprasCompletas(projetoId?: string): Promise<ListaCompraCompleta[]> {
  let query = supabase
    .from("v_lista_compras_completa")
    .select("*")
    .order("created_at", { ascending: false });

  if (projetoId) {
    query = query.eq("projeto_id", projetoId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ListaCompraCompleta[];
}

// ============================================================
// ESTATISTICAS
// ============================================================

export interface EstatisticasCompras {
  total_projetos: number;
  total_itens: number;
  valor_total: number;
  valor_pendente: number;
  valor_comprado: number;
  valor_entregue: number;
  total_fee_arrecadado: number;
  itens_por_status: Record<StatusCompra, number>;
}

export async function obterEstatisticasCompras(): Promise<EstatisticasCompras> {
  const { data: projetos } = await supabase
    .from("projetos_compras")
    .select("id");

  const { data: itens } = await supabase
    .from("projeto_lista_compras")
    .select("status, valor_total, valor_fee");

  const itensList = itens || [];

  const stats: EstatisticasCompras = {
    total_projetos: projetos?.length || 0,
    total_itens: itensList.length,
    valor_total: itensList.reduce((acc, i) => acc + (i.valor_total || 0), 0),
    valor_pendente: itensList
      .filter(i => i.status === "PENDENTE")
      .reduce((acc, i) => acc + (i.valor_total || 0), 0),
    valor_comprado: itensList
      .filter(i => i.status === "COMPRADO")
      .reduce((acc, i) => acc + (i.valor_total || 0), 0),
    valor_entregue: itensList
      .filter(i => i.status === "ENTREGUE")
      .reduce((acc, i) => acc + (i.valor_total || 0), 0),
    total_fee_arrecadado: itensList.reduce((acc, i) => acc + (i.valor_fee || 0), 0),
    itens_por_status: {
      PENDENTE: itensList.filter(i => i.status === "PENDENTE").length,
      APROVADO: itensList.filter(i => i.status === "APROVADO").length,
      COMPRADO: itensList.filter(i => i.status === "COMPRADO").length,
      ENTREGUE: itensList.filter(i => i.status === "ENTREGUE").length,
      CANCELADO: itensList.filter(i => i.status === "CANCELADO").length,
    },
  };

  return stats;
}

// ============================================================
// HELPERS
// ============================================================

export const STATUS_COMPRA_LABELS: Record<StatusCompra, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  COMPRADO: "Comprado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const STATUS_COMPRA_COLORS: Record<StatusCompra, string> = {
  PENDENTE: "#F59E0B", // Amarelo
  APROVADO: "#3B82F6", // Azul
  COMPRADO: "#8B5CF6", // Roxo
  ENTREGUE: "#10B981", // Verde
  CANCELADO: "#EF4444", // Vermelho
};

export const TIPO_COMPRA_LABELS: Record<TipoCompra, string> = {
  WG_COMPRA: "WG Compra",
  CLIENTE_DIRETO: "Cliente Direto",
};

export const TIPO_CONTA_LABELS: Record<TipoConta, string> = {
  REAL: "Conta Real",
  VIRTUAL: "Conta Virtual",
};

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
