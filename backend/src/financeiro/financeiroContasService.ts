import { supabase } from "../shared/supabaseClient";

export async function obterOuCriarContaPadrao(
  nucleo: string,
  tipo: "entrada" | "saida"
): Promise<string> {
  const { data, error } = await supabase.rpc("criar_conta_padrao", {
    p_nucleo: nucleo,
    p_tipo: tipo,
  });

  if (error) {
    console.error("Erro RPC criar_conta_padrao:", error);
    throw error;
  }

  return data;
}

export async function obterContasPadraoNucleo(nucleo: string) {
  const entrada = await obterOuCriarContaPadrao(nucleo, "entrada");
  const saida   = await obterOuCriarContaPadrao(nucleo, "saida");

  return { entrada, saida };
}
