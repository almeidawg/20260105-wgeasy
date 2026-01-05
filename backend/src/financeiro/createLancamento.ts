import { supabase } from "../shared/supabaseClient";

export async function buscarLancamentoPorId(id: string) {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
