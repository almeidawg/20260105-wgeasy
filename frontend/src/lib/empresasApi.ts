// ============================================================
// API: Empresas do Grupo
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { supabase } from "./supabaseClient";
import type {
  EmpresaGrupo,
  ContaBancaria,
  EmpresaComContas,
  EmpresaFormData,
  ContaBancariaFormData,
} from "@/types/empresas";

// ============================================================
// EMPRESAS DO GRUPO
// ============================================================

/**
 * Listar todas as empresas do grupo (com join de núcleo)
 */
export async function listarEmpresas(): Promise<EmpresaGrupo[]> {
  const { data, error } = await supabase
    .from("empresas_grupo")
    .select(
      `
      *,
      nucleos:nucleo_id (
        id,
        nome,
        cor
      )
    `
    )
    .eq("ativo", true)
    .order("razao_social");

  if (error) {
    console.error("Erro ao listar empresas:", error);
    throw new Error(`Erro ao listar empresas: ${error.message}`);
  }

  // Mapear para incluir nucleo_nome e nucleo_cor
  return (data || []).map((empresa: any) => ({
    ...empresa,
    nucleo_nome: empresa.nucleos?.nome,
    nucleo_cor: empresa.nucleos?.cor,
  }));
}

/**
 * Buscar empresa por ID (com núcleo)
 */
export async function buscarEmpresaPorId(id: string): Promise<EmpresaGrupo | null> {
  const { data, error } = await supabase
    .from("empresas_grupo")
    .select(
      `
      *,
      nucleos:nucleo_id (
        id,
        nome,
        cor
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar empresa:", error);
    throw new Error(`Erro ao buscar empresa: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    nucleo_nome: data.nucleos?.nome,
    nucleo_cor: data.nucleos?.cor,
  };
}

/**
 * Buscar empresa completa (com contas bancárias)
 */
export async function buscarEmpresaCompleta(id: string): Promise<EmpresaComContas | null> {
  const empresa = await buscarEmpresaPorId(id);
  if (!empresa) return null;

  const contas = await listarContasPorEmpresa(id);

  return {
    ...empresa,
    contas_bancarias: contas,
    conta_padrao: contas.find((c) => c.padrao),
  };
}

/**
 * Criar nova empresa
 */
export async function criarEmpresa(dados: EmpresaFormData): Promise<EmpresaGrupo> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("empresas_grupo")
    .insert({
      ...dados,
      criado_por: user?.id,
      atualizado_por: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar empresa:", error);
    throw new Error(`Erro ao criar empresa: ${error.message}`);
  }

  return data;
}

/**
 * Atualizar empresa
 */
export async function atualizarEmpresa(
  id: string,
  dados: Partial<EmpresaFormData>
): Promise<EmpresaGrupo> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("empresas_grupo")
    .update({
      ...dados,
      atualizado_por: user?.id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar empresa:", error);
    throw new Error(`Erro ao atualizar empresa: ${error.message}`);
  }

  return data;
}

/**
 * Desativar empresa (soft delete)
 */
export async function desativarEmpresa(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("empresas_grupo")
    .update({
      ativo: false,
      atualizado_por: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao desativar empresa:", error);
    throw new Error(`Erro ao desativar empresa: ${error.message}`);
  }
}

/**
 * Reativar empresa
 */
export async function reativarEmpresa(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("empresas_grupo")
    .update({
      ativo: true,
      atualizado_por: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao reativar empresa:", error);
    throw new Error(`Erro ao reativar empresa: ${error.message}`);
  }
}

/**
 * Excluir empresa permanentemente (cuidado!)
 */
export async function excluirEmpresa(id: string): Promise<void> {
  const { error } = await supabase.from("empresas_grupo").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir empresa:", error);
    throw new Error(`Erro ao excluir empresa: ${error.message}`);
  }
}

// ============================================================
// CONTAS BANCÁRIAS
// ============================================================

/**
 * Listar contas bancárias por empresa
 */
export async function listarContasPorEmpresa(empresaId: string): Promise<ContaBancaria[]> {
  const { data, error } = await supabase
    .from("empresas_contas_bancarias")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .order("padrao", { ascending: false }) // Padrão primeiro
    .order("apelido");

  if (error) {
    console.error("Erro ao listar contas:", error);
    throw new Error(`Erro ao listar contas: ${error.message}`);
  }

  return data || [];
}

/**
 * Buscar conta bancária por ID
 */
export async function buscarContaPorId(id: string): Promise<ContaBancaria | null> {
  const { data, error } = await supabase
    .from("empresas_contas_bancarias")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar conta:", error);
    throw new Error(`Erro ao buscar conta: ${error.message}`);
  }

  return data;
}

/**
 * Buscar conta padrão de uma empresa
 */
export async function buscarContaPadrao(empresaId: string): Promise<ContaBancaria | null> {
  const { data, error } = await supabase
    .from("empresas_contas_bancarias")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("padrao", true)
    .eq("ativo", true)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = não encontrado
    console.error("Erro ao buscar conta padrão:", error);
    throw new Error(`Erro ao buscar conta padrão: ${error.message}`);
  }

  return data || null;
}

/**
 * Criar nova conta bancária
 */
export async function criarConta(
  empresaId: string,
  dados: ContaBancariaFormData
): Promise<ContaBancaria> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("empresas_contas_bancarias")
    .insert({
      ...dados,
      empresa_id: empresaId,
      criado_por: user?.id,
      atualizado_por: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar conta:", error);
    throw new Error(`Erro ao criar conta: ${error.message}`);
  }

  return data;
}

/**
 * Atualizar conta bancária
 */
export async function atualizarConta(
  id: string,
  dados: Partial<ContaBancariaFormData>
): Promise<ContaBancaria> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("empresas_contas_bancarias")
    .update({
      ...dados,
      atualizado_por: user?.id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar conta:", error);
    throw new Error(`Erro ao atualizar conta: ${error.message}`);
  }

  return data;
}

/**
 * Definir conta como padrão
 * (O trigger do banco desativa automaticamente as outras)
 */
export async function definirContaPadrao(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("empresas_contas_bancarias")
    .update({
      padrao: true,
      atualizado_por: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao definir conta padrão:", error);
    throw new Error(`Erro ao definir conta padrão: ${error.message}`);
  }
}

/**
 * Desativar conta bancária
 */
export async function desativarConta(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("empresas_contas_bancarias")
    .update({
      ativo: false,
      atualizado_por: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao desativar conta:", error);
    throw new Error(`Erro ao desativar conta: ${error.message}`);
  }
}

/**
 * Reativar conta bancária
 */
export async function reativarConta(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("empresas_contas_bancarias")
    .update({
      ativo: true,
      atualizado_por: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao reativar conta:", error);
    throw new Error(`Erro ao reativar conta: ${error.message}`);
  }
}

/**
 * Excluir conta permanentemente
 */
export async function excluirConta(id: string): Promise<void> {
  const { error } = await supabase.from("empresas_contas_bancarias").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir conta:", error);
    throw new Error(`Erro ao excluir conta: ${error.message}`);
  }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Verificar se empresa tem contas bancárias cadastradas
 */
export async function empresaTemContas(empresaId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("empresas_contas_bancarias")
    .select("*", { count: "exact", head: true })
    .eq("empresa_id", empresaId)
    .eq("ativo", true);

  if (error) {
    console.error("Erro ao verificar contas:", error);
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Verificar se CNPJ já está cadastrado
 */
export async function cnpjJaCadastrado(cnpj: string, excludeId?: string): Promise<boolean> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  let query = supabase
    .from("empresas_grupo")
    .select("id", { count: "exact", head: true })
    .eq("cnpj", cnpjLimpo);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Erro ao verificar CNPJ:", error);
    return false;
  }

  return (count || 0) > 0;
}
