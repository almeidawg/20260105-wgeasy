import { supabase } from "../shared/supabaseClient";
import { v4 as uuid } from "uuid";

export async function criarParcelasParaLancamento(lancamento: any) {
  const parcelas = [];

  const parcela = {
    id: uuid(),
    lancamento_id: lancamento.id,
    numero: 1,
    valor: lancamento.valor_total,
    data_emissao: lancamento.data_emissao,
    data_competencia: lancamento.data_competencia,
    vencimento: lancamento.vencimento,
    status: lancamento.status,
    nucleo: lancamento.nucleo
  };

  parcelas.push(parcela);

  const { error } = await supabase
    .from("financeiro_parcelas")
    .insert(parcelas);

  if (error) {
    console.error("❌ Erro ao criar parcelas:", error);
    throw error;
  }

  return parcelas;
}
