// src/lib/tasksApi.ts
import { supabase } from "@/lib/supabaseClient";

export interface ProjectTask {
  id?: string;
  project_id: string;
  titulo: string;
  descricao?: string;
  responsavel?: string;
  inicio?: string;
  fim?: string;
  progresso?: number;
  status?: string;
}

export async function listarTasks(projectId: string) {
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("inicio", { ascending: true });

  if (error) throw error;
  return data;
}

export async function criarTask(task: ProjectTask) {
  const { error } = await supabase.from("project_tasks").insert(task);
  if (error) throw error;
}

export async function atualizarTask(id: string, dados: Partial<ProjectTask>) {
  const { error } = await supabase
    .from("project_tasks")
    .update(dados)
    .eq("id", id);
  if (error) throw error;
}

export async function deletarTask(id: string) {
  const { error } = await supabase
    .from("project_tasks")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
