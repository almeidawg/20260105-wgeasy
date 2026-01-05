import { supabase } from "@/lib/supabaseClient";

/* Importar fornecedor automaticamente */
export async function importarFornecedor(url: string) {
  const { data, error } = await supabase.functions.invoke("importar_fornecedor", {
    body: { url },
  });

  if (error) throw error;
  return data;
}

/* Criar fornecedor */
export async function criarFornecedor(payload: any) {
  const { data, error } = await supabase
    .from("fornecedores")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/* Listar fornecedores */
export async function listarFornecedores() {
  const { data, error } = await supabase.from("fornecedores").select("*");

  if (error) throw error;
  return data;
}
