// src/lib/oportunidadesApi.ts
import { supabase } from "@/lib/supabaseClient";

export type EstagioOportunidade =
  | "qualificacao"
  | "proposta"
  | "negociacao"
  | "fechamento";

export type StatusOportunidade =
  | "novo"
  | "em_andamento"
  | "proposta_enviada"
  | "negociacao"
  | "ganho"
  | "perdido"
  | "cancelado";

export interface Oportunidade {
  id: string;
  titulo: string;
  cliente_id: string;
  descricao?: string | null;
  valor: number | null;
  moeda?: string;
  estagio: EstagioOportunidade | null;
  status: StatusOportunidade;
  origem: string | null;
  responsavel_id: string | null;
  data_abertura?: string;
  data_fechamento_prevista: string | null;
  data_fechamento_real?: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
  pessoas?: { nome: string } | null;
}

export async function listarOportunidades(): Promise<Oportunidade[]> {
  const { data, error } = await supabase
    .from("oportunidades")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) throw error;

  // Buscar nomes dos clientes manualmente
  if (data && data.length > 0) {
    const clienteIds = data.map(o => o.cliente_id).filter(Boolean);
    if (clienteIds.length > 0) {
      const { data: clientes } = await supabase
        .from("pessoas")
        .select("id, nome")
        .in("id", clienteIds);

      const clientesMap = new Map(clientes?.map(c => [c.id, c]) || []);
      return data.map(o => ({
        ...o,
        pessoas: o.cliente_id ? clientesMap.get(o.cliente_id) : null
      })) as any;
    }
  }

  return data as any;
}

export async function listarOportunidadesPorEstagio(estagio: EstagioOportunidade) {
  const { data, error } = await supabase
    .from("oportunidades")
    .select("*")
    .eq("estagio", estagio)
    .order("criado_em", { ascending: false });

  if (error) throw error;

  // Buscar nomes dos clientes manualmente
  if (data && data.length > 0) {
    const clienteIds = data.map(o => o.cliente_id).filter(Boolean);
    if (clienteIds.length > 0) {
      const { data: clientes } = await supabase
        .from("pessoas")
        .select("id, nome")
        .in("id", clienteIds);

      const clientesMap = new Map(clientes?.map(c => [c.id, c]) || []);
      return data.map(o => ({
        ...o,
        pessoas: o.cliente_id ? clientesMap.get(o.cliente_id) : null
      })) as any;
    }
  }

  return data as any;
}

export async function buscarOportunidade(id: string): Promise<Oportunidade> {
  const { data, error } = await supabase
    .from("oportunidades")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  // Buscar nome do cliente manualmente
  if (data && data.cliente_id) {
    const { data: cliente } = await supabase
      .from("pessoas")
      .select("id, nome")
      .eq("id", data.cliente_id)
      .single();

    return {
      ...data,
      pessoas: cliente
    } as any;
  }

  return data as any;
}

export async function criarOportunidade(payload: Partial<Oportunidade>) {
  const { data, error } = await supabase
    .from("oportunidades")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  // Buscar nome do cliente manualmente
  if (data && data.cliente_id) {
    const { data: cliente } = await supabase
      .from("pessoas")
      .select("id, nome")
      .eq("id", data.cliente_id)
      .single();

    return {
      ...data,
      pessoas: cliente
    } as any;
  }

  return data as any;
}

export async function atualizarOportunidade(
  id: string,
  payload: Partial<Oportunidade>
) {
  const { data, error } = await supabase
    .from("oportunidades")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  // Buscar nome do cliente manualmente
  if (data && data.cliente_id) {
    const { data: cliente } = await supabase
      .from("pessoas")
      .select("id, nome")
      .eq("id", data.cliente_id)
      .single();

    return {
      ...data,
      pessoas: cliente
    } as any;
  }

  return data as any;
}

export async function moverOportunidade(
  id: string,
  novoEstagio: EstagioOportunidade
) {
  const { data, error } = await supabase
    .from("oportunidades")
    .update({ estagio: novoEstagio })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  // Buscar nome do cliente manualmente
  if (data && data.cliente_id) {
    const { data: cliente } = await supabase
      .from("pessoas")
      .select("id, nome")
      .eq("id", data.cliente_id)
      .single();

    return {
      ...data,
      pessoas: cliente
    } as any;
  }

  return data as any;
}
