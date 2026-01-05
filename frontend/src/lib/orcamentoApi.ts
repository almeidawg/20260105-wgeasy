// src/lib/orcamentoApi.ts
import { supabase } from "@/lib/supabaseClient";

// Re-exportar tipos do arquivo centralizado
export * from "@/types/orcamentos";

// Import types for internal use
import type {
  Orcamento,
  OrcamentoItem,
  OrcamentoCompleto,
  StatusOrcamento,
} from "@/types/orcamentos";

// Re-exportar funções do workflow
export * from "@/lib/workflows/orcamentoWorkflow";

/* ===========================
   ORÇAMENTO PRINCIPAL
=========================== */

export async function listarOrcamentos(): Promise<Orcamento[]> {
  const { data, error } = await supabase
    .from("orcamentos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data as Orcamento[];
}

export async function buscarOrcamento(id: string): Promise<Orcamento> {
  const { data, error } = await supabase
    .from("orcamentos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Orcamento;
}

export async function atualizarOrcamento(
  id: string,
  payload: Partial<Orcamento>
) {
  const { data, error } = await supabase
    .from("orcamentos")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Orcamento;
}

/* ===========================
   ITENS
=========================== */

export async function listarItens(
  orcamento_id: string
): Promise<OrcamentoItem[]> {
  const { data, error } = await supabase
    .from("orcamento_itens")
    .select("*")
    .eq("orcamento_id", orcamento_id)
    .order("descricao", { ascending: true });

  if (error) throw error;
  return data as OrcamentoItem[];
}

export async function criarItem(payload: Partial<OrcamentoItem>) {
  const { data, error } = await supabase
    .from("orcamento_itens")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as OrcamentoItem;
}

export async function removerItem(id: string) {
  const { error } = await supabase
    .from("orcamento_itens")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

/* ===========================
   CÁLCULO RESUMO
=========================== */

export async function calcularResumo(orcamento_id: string) {
  const itens = await listarItens(orcamento_id);

  const totalGeral = itens.reduce(
    (acc, i) => acc + Number(i.subtotal ?? 0),
    0
  );

  const margem = totalGeral * 0.15;
  const imposto = totalGeral * 0.07;

  return {
    totalGeral,
    margem,
    imposto,
    totalFinal: totalGeral + margem + imposto,
  };
}

/**
 * Criar novo orçamento
 */
export async function criarOrcamento(payload: Partial<Orcamento>) {
  const { data, error } = await supabase
    .from("orcamentos")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as Orcamento;
}
