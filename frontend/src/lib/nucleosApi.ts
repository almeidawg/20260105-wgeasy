// ============================================================
// API: Núcleos (Unidades de Negócio)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { supabase } from "./supabaseClient";

export interface Nucleo {
  id: string;
  nome: string;
  cor?: string;
  ativo: boolean;
  criado_em: string;
}

/**
 * Listar todos os núcleos ativos
 */
export async function listarNucleos(): Promise<Nucleo[]> {
  const { data, error } = await supabase
    .from("nucleos")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("Erro ao listar núcleos:", error);
    throw new Error(`Erro ao listar núcleos: ${error.message}`);
  }

  return data || [];
}

/**
 * Buscar núcleo por ID
 */
export async function buscarNucleoPorId(id: string): Promise<Nucleo | null> {
  const { data, error } = await supabase
    .from("nucleos")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Erro ao buscar núcleo:", error);
    throw new Error(`Erro ao buscar núcleo: ${error.message}`);
  }

  return data;
}
