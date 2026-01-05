// src/lib/projectsApi.ts
import { supabaseRaw as supabase } from "@/lib/supabaseClient";

export interface Project {
  id?: string;
  nome: string;
  obra_id?: string | null;
  descricao?: string | null;
  inicio: string | null;
  fim: string | null;
  progresso?: number;
  status?: "planejado" | "andamento" | "atrasado" | "concluido";
  approval_status?: "pendente" | "aprovado" | "rejeitado";
  criado_em?: string;
}

// =======================================================
// LISTAR PROJETOS
// =======================================================
export async function listarProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projetos")
    .select("*, obras(nome)")
    .order("inicio", { ascending: true });

  if (error) throw error;

  return data as Project[];
}

// =======================================================
// BUSCAR UM PROJETO ESPECÍFICO
// =======================================================
export async function buscarProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projetos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as Project;
}

// =======================================================
// CRIAR PROJETO
// =======================================================
export async function criarProject(dados: Project): Promise<Project> {
  // Converter strings vazias em null para campos de data
  const dadosLimpos = {
    ...dados,
    inicio: dados.inicio === "" ? null : dados.inicio,
    fim: dados.fim === "" ? null : dados.fim,
    obra_id: dados.obra_id === "" ? null : dados.obra_id,
  };

  const { data, error } = await supabase
    .from("projetos")
    .insert(dadosLimpos)
    .select()
    .single();

  if (error) throw error;

  return data as Project;
}

// =======================================================
// EDITAR PROJETO
// =======================================================
export async function atualizarProject(
  id: string,
  dados: Partial<Project>
): Promise<void> {
  // Converter strings vazias em null para campos de data
  const dadosLimpos: any = { ...dados };

  if ("inicio" in dados) {
    dadosLimpos.inicio = dados.inicio === "" ? null : dados.inicio;
  }
  if ("fim" in dados) {
    dadosLimpos.fim = dados.fim === "" ? null : dados.fim;
  }
  if ("obra_id" in dados) {
    dadosLimpos.obra_id = dados.obra_id === "" ? null : dados.obra_id;
  }

  const { error } = await supabase
    .from("projetos")
    .update(dadosLimpos)
    .eq("id", id);

  if (error) throw error;
}

// =======================================================
// DELETAR PROJETO
// =======================================================
export async function deletarProject(id: string): Promise<void> {
  const { error } = await supabase
    .from("projetos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
