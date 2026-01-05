import { supabase } from "../shared/supabaseClient";
import { v4 as uuid } from "uuid";
import { obterOuCriarContaPadrao } from "./financeiroContasService";

export interface ItemProposta {
  id: string;
  nome: string;
  quantidade: number;
  preco_total: number;
  tipo: string;
  nucleo_id: string;
}

export interface ContratoPorNucleo {
  contrato: {
    id: string;
    cliente_id: string | null;
    nucleo_id: string;
    status: string;
    criado_em: string;
    observacoes?: string | null;
  };
  itens: ItemProposta[];
}

const CLIENTE_ID = "5f1b03a0-ccbe-43cc-b430-c2675fa0f733";

async function resolverEstruturaFinanceiraPorNucleo(nucleoNome: string) {
  const { data: categoria } = await supabase
    .from("financeiro_categorias")
    .select("id")
    .eq("nucleo", nucleoNome)
    .limit(1)
    .single();

  const categoriaId = categoria?.id ?? null;

  const { data: centro } = await supabase
    .from("financeiro_centros_custo")
    .select("id")
    .eq("nucleo", nucleoNome)
    .limit(1)
    .single();

  const centroCustoId = centro?.id ?? null;

  return { categoriaId, centroCustoId };
}

export async function criarFinanceiroParaContratos(
  contratosPorNucleo: ContratoPorNucleo[]
) {
  const resultados: any[] = [];

  for (const contratoNucleo of contratosPorNucleo) {
    const { contrato, itens } = contratoNucleo;
    const nucleoNome = contrato.nucleo_id;

    const valorTotal = itens.reduce(
      (acc, item) => acc + item.preco_total,
      0
    );

    const hoje = new Date();
    const dataHoje = hoje.toISOString().slice(0, 10);

    const vencimento = new Date();
    vencimento.setDate(hoje.getDate() + 5);

    const contaEntradaId = await obterOuCriarContaPadrao(nucleoNome, "entrada");

    const { categoriaId, centroCustoId } =
      await resolverEstruturaFinanceiraPorNucleo(nucleoNome);

    const payload = {
      id: uuid(),
      tipo: "entrada",
      natureza: "operacional",
      descricao: `Receita - Contrato ${nucleoNome.toUpperCase()}`,
      valor_total: valorTotal,

      data_emissao: dataHoje,
      data_competencia: dataHoje,
      vencimento: vencimento.toISOString().slice(0, 10),

      numero_parcelas: 1,
      tipo_parcelamento: "unica",
      status: "previsto",

      pessoa_id: CLIENTE_ID,
      conta_id: contaEntradaId,
      categoria_id: categoriaId,
      centro_custo_id: centroCustoId,

      contrato_id: contrato.id,
      unidade_negocio: nucleoNome,
      nucleo: nucleoNome
    };

    const { data, error } = await supabase
      .from("financeiro_lancamentos")
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.error("❌ Erro ao criar financeiro:", error);
      continue;
    }

    resultados.push(data ?? payload);
  }

  return resultados;
}
