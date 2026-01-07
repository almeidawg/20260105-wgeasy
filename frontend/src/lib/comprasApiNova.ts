// ============================================================
// API DE COMPRAS - WG EASY
// Gerenciamento completo de pedidos de compra
// ============================================================

import { supabase } from "@/lib/supabaseClient";
import type { ProdutoImportado } from "@/lib/importadorProdutos";

// ============================================================
// TYPES
// ============================================================

export type StatusPedido = 'aberto' | 'aprovado' | 'em_compras' | 'recebido' | 'cancelado';
export type UnidadeNegocio = 'Arquitetura' | 'Engenharia' | 'Marcenaria';
export type OrigemItem = 'manual' | 'importado';

export interface PedidoCompra {
  id: string;
  numero: string;
  projeto_id: string | null;
  contrato_id: string | null;
  fornecedor_id: string | null;
  unidade: UnidadeNegocio | null;
  data_pedido: string;
  data_previsao_entrega: string | null;
  data_entrega_real: string | null;
  valor_total: number;
  status: StatusPedido;
  condicoes_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface PedidoCompraItem {
  id: string;
  pedido_id: string;
  descricao: string;
  sku: string | null;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  preco_total: number;
  origem: OrigemItem;
  url_origem: string | null;
  imagem_url: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface PedidoCompraCompleto extends PedidoCompra {
  itens?: PedidoCompraItem[];
  fornecedor?: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
  projeto?: {
    id: string;
    nome: string;
  };
  contrato?: {
    id: string;
    numero: string;
  };
}

export interface CriarPedidoData {
  projeto_id?: string;
  contrato_id?: string;
  fornecedor_id?: string;
  unidade?: UnidadeNegocio;
  data_pedido?: string;
  data_previsao_entrega?: string;
  condicoes_pagamento?: string;
  observacoes?: string;
}

export interface AdicionarItemData {
  descricao: string;
  sku?: string;
  quantidade: number;
  unidade?: string;
  preco_unitario: number;
  origem?: OrigemItem;
  url_origem?: string;
  imagem_url?: string;
  observacoes?: string;
}

// ============================================================
// PEDIDOS
// ============================================================

/**
 * Listar todos os pedidos de compra
 */
export async function listarPedidosCompra(): Promise<PedidoCompraCompleto[]> {
  // Buscar pedidos sem join (evita erro de FK)
  const { data, error } = await supabase
    .from('pedidos_compra')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar pedidos:', error);
    throw error;
  }

  if (!data || data.length === 0) return [];

  // Buscar fornecedores separadamente
  const fornecedorIds = [...new Set(data.map(p => p.fornecedor_id).filter(Boolean))];
  let fornecedoresMap: Record<string, any> = {};
  if (fornecedorIds.length > 0) {
    const { data: fornecedores } = await supabase
      .from('pessoas')
      .select('id, nome, email, telefone')
      .in('id', fornecedorIds);
    if (fornecedores) {
      fornecedoresMap = Object.fromEntries(fornecedores.map(f => [f.id, f]));
    }
  }

  // Buscar projetos separadamente
  const projetoIds = [...new Set(data.map(p => p.projeto_id).filter(Boolean))];
  let projetosMap: Record<string, any> = {};
  if (projetoIds.length > 0) {
    const { data: projetos } = await supabase
      .from('projetos')
      .select('id, nome')
      .in('id', projetoIds);
    if (projetos) {
      projetosMap = Object.fromEntries(projetos.map(p => [p.id, p]));
    }
  }

  // Buscar contratos separadamente
  const contratoIds = [...new Set(data.map(p => p.contrato_id).filter(Boolean))];
  let contratosMap: Record<string, any> = {};
  if (contratoIds.length > 0) {
    const { data: contratos } = await supabase
      .from('contratos')
      .select('id, numero')
      .in('id', contratoIds);
    if (contratos) {
      contratosMap = Object.fromEntries(contratos.map(c => [c.id, c]));
    }
  }

  return data.map(p => ({
    ...p,
    fornecedor: p.fornecedor_id ? fornecedoresMap[p.fornecedor_id] : null,
    projeto: p.projeto_id ? projetosMap[p.projeto_id] : null,
    contrato: p.contrato_id ? contratosMap[p.contrato_id] : null,
  })) as PedidoCompraCompleto[];
}

/**
 * Buscar pedido por ID
 */
export async function buscarPedidoCompra(id: string): Promise<PedidoCompraCompleto> {
  // Buscar pedido sem join (evita erro de FK)
  const { data, error } = await supabase
    .from('pedidos_compra')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }

  // Buscar fornecedor separadamente
  let fornecedor = null;
  if (data.fornecedor_id) {
    const { data: f } = await supabase
      .from('pessoas')
      .select('id, nome, email, telefone')
      .eq('id', data.fornecedor_id)
      .single();
    fornecedor = f;
  }

  // Buscar projeto separadamente
  let projeto = null;
  if (data.projeto_id) {
    const { data: p } = await supabase
      .from('projetos')
      .select('id, nome')
      .eq('id', data.projeto_id)
      .single();
    projeto = p;
  }

  // Buscar contrato separadamente
  let contrato = null;
  if (data.contrato_id) {
    const { data: c } = await supabase
      .from('contratos')
      .select('id, numero')
      .eq('id', data.contrato_id)
      .single();
    contrato = c;
  }

  // Buscar itens
  const itens = await listarItensPedido(id);

  return {
    ...data,
    fornecedor,
    projeto,
    contrato,
    itens,
  } as PedidoCompraCompleto;
}

/**
 * Criar novo pedido de compra
 */
export async function criarPedidoCompra(dados: CriarPedidoData): Promise<PedidoCompra> {
  // Gerar número do pedido
  const { data: numero, error: numeroError } = await supabase
    .rpc('gerar_numero_pedido_compra');

  if (numeroError) {
    console.error('Erro ao gerar número do pedido:', numeroError);
    throw numeroError;
  }

  // Buscar usuário atual
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('pedidos_compra')
    .insert({
      numero,
      ...dados,
      data_pedido: dados.data_pedido || new Date().toISOString().split('T')[0],
      status: 'aberto',
      valor_total: 0,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }

  return data as PedidoCompra;
}

/**
 * Atualizar pedido de compra
 */
export async function atualizarPedidoCompra(
  id: string,
  dados: Partial<CriarPedidoData>
): Promise<PedidoCompra> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('pedidos_compra')
    .update({
      ...dados,
      updated_by: user?.id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  }

  return data as PedidoCompra;
}

/**
 * Alterar status do pedido
 */
export async function alterarStatusPedido(
  id: string,
  status: StatusPedido
): Promise<PedidoCompra> {
  const { data: { user } } = await supabase.auth.getUser();

  const updateData: any = {
    status,
    updated_by: user?.id,
  };

  // Se marcar como recebido, definir data de entrega
  if (status === 'recebido') {
    updateData.data_entrega_real = new Date().toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('pedidos_compra')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao alterar status:', error);
    throw error;
  }

  return data as PedidoCompra;
}

/**
 * Deletar pedido de compra
 */
export async function deletarPedidoCompra(id: string): Promise<void> {
  const { error } = await supabase
    .from('pedidos_compra')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar pedido:', error);
    throw error;
  }
}

// ============================================================
// ITENS
// ============================================================

/**
 * Listar itens de um pedido
 */
export async function listarItensPedido(pedido_id: string): Promise<PedidoCompraItem[]> {
  const { data, error } = await supabase
    .from('pedidos_compra_itens')
    .select('*')
    .eq('pedido_id', pedido_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao listar itens:', error);
    throw error;
  }

  return data as PedidoCompraItem[];
}

/**
 * Adicionar item ao pedido
 */
export async function adicionarItemPedido(
  pedido_id: string,
  dados: AdicionarItemData
): Promise<PedidoCompraItem> {
  const { data, error } = await supabase
    .from('pedidos_compra_itens')
    .insert({
      pedido_id,
      descricao: dados.descricao,
      sku: dados.sku || null,
      quantidade: dados.quantidade,
      unidade: dados.unidade || 'UN',
      preco_unitario: dados.preco_unitario,
      preco_total: dados.quantidade * dados.preco_unitario,
      origem: dados.origem || 'manual',
      url_origem: dados.url_origem || null,
      imagem_url: dados.imagem_url || null,
      observacoes: dados.observacoes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar item:', error);
    throw error;
  }

  return data as PedidoCompraItem;
}

/**
 * Adicionar item importado ao pedido
 */
export async function adicionarItemImportado(
  pedido_id: string,
  produtoImportado: ProdutoImportado,
  quantidade: number = 1
): Promise<PedidoCompraItem> {
  return adicionarItemPedido(pedido_id, {
    descricao: produtoImportado.titulo,
    sku: produtoImportado.sku,
    quantidade,
    preco_unitario: produtoImportado.preco,
    origem: 'importado',
    url_origem: produtoImportado.url_origem,
    imagem_url: produtoImportado.imagem_url,
  });
}

/**
 * Atualizar item do pedido
 */
export async function atualizarItemPedido(
  id: string,
  dados: Partial<AdicionarItemData>
): Promise<PedidoCompraItem> {
  const updateData: any = { ...dados };

  // Recalcular preço total se quantidade ou preço mudaram
  if (dados.quantidade !== undefined || dados.preco_unitario !== undefined) {
    const { data: itemAtual } = await supabase
      .from('pedidos_compra_itens')
      .select('quantidade, preco_unitario')
      .eq('id', id)
      .single();

    if (itemAtual) {
      const qtd = dados.quantidade ?? itemAtual.quantidade;
      const preco = dados.preco_unitario ?? itemAtual.preco_unitario;
      updateData.preco_total = qtd * preco;
    }
  }

  const { data, error } = await supabase
    .from('pedidos_compra_itens')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }

  return data as PedidoCompraItem;
}

/**
 * Deletar item do pedido
 */
export async function deletarItemPedido(id: string): Promise<void> {
  const { error } = await supabase
    .from('pedidos_compra_itens')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Listar pedidos por projeto
 */
export async function listarPedidosPorProjeto(projeto_id: string): Promise<PedidoCompraCompleto[]> {
  // Buscar pedidos sem join (evita erro de FK)
  const { data, error } = await supabase
    .from('pedidos_compra')
    .select('*')
    .eq('projeto_id', projeto_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar pedidos por projeto:', error);
    throw error;
  }

  if (!data || data.length === 0) return [];

  // Buscar fornecedores separadamente
  const fornecedorIds = [...new Set(data.map(p => p.fornecedor_id).filter(Boolean))];
  let fornecedoresMap: Record<string, any> = {};
  if (fornecedorIds.length > 0) {
    const { data: fornecedores } = await supabase
      .from('pessoas')
      .select('id, nome, email, telefone')
      .in('id', fornecedorIds);
    if (fornecedores) {
      fornecedoresMap = Object.fromEntries(fornecedores.map(f => [f.id, f]));
    }
  }

  return data.map(p => ({
    ...p,
    fornecedor: p.fornecedor_id ? fornecedoresMap[p.fornecedor_id] : null,
  })) as PedidoCompraCompleto[];
}

/**
 * Listar pedidos por contrato
 */
export async function listarPedidosPorContrato(contrato_id: string): Promise<PedidoCompraCompleto[]> {
  // Buscar pedidos sem join (evita erro de FK)
  const { data, error } = await supabase
    .from('pedidos_compra')
    .select('*')
    .eq('contrato_id', contrato_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar pedidos por contrato:', error);
    throw error;
  }

  if (!data || data.length === 0) return [];

  // Buscar fornecedores separadamente
  const fornecedorIds = [...new Set(data.map(p => p.fornecedor_id).filter(Boolean))];
  let fornecedoresMap: Record<string, any> = {};
  if (fornecedorIds.length > 0) {
    const { data: fornecedores } = await supabase
      .from('pessoas')
      .select('id, nome, email, telefone')
      .in('id', fornecedorIds);
    if (fornecedores) {
      fornecedoresMap = Object.fromEntries(fornecedores.map(f => [f.id, f]));
    }
  }

  return data.map(p => ({
    ...p,
    fornecedor: p.fornecedor_id ? fornecedoresMap[p.fornecedor_id] : null,
  })) as PedidoCompraCompleto[];
}

/**
 * Estatísticas de compras
 */
export interface EstatisticasCompras {
  total_pedidos: number;
  total_valor: number;
  pedidos_abertos: number;
  pedidos_em_compras: number;
  pedidos_recebidos: number;
  valor_medio: number;
}

export async function obterEstatisticasCompras(): Promise<EstatisticasCompras> {
  const { data, error } = await supabase
    .from('pedidos_compra')
    .select('status, valor_total');

  if (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }

  const stats: EstatisticasCompras = {
    total_pedidos: data.length,
    total_valor: data.reduce((acc, p) => acc + (p.valor_total || 0), 0),
    pedidos_abertos: data.filter(p => p.status === 'aberto').length,
    pedidos_em_compras: data.filter(p => p.status === 'em_compras').length,
    pedidos_recebidos: data.filter(p => p.status === 'recebido').length,
    valor_medio: data.length > 0 ? data.reduce((acc, p) => acc + (p.valor_total || 0), 0) / data.length : 0,
  };

  return stats;
}
