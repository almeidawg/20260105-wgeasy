// ========================================================================
// Script de Teste: Pipeline Contrato → Financeiro
// Cria um contrato de teste para um cliente existente, gera lançamentos
// financeiros (entrada + parcelas) e um resumo em `financeiro_projetos_resumo`.
//
// Uso:
//   cd wgeasy/backend
//   npm run test:financeiro
//
// Depois conferir no front:
//   - Financeiro > Projetos  (card do contrato de teste)
//   - Financeiro > Lançamentos (entradas geradas)
// ========================================================================

import { v4 as uuid } from "uuid";
import { supabase } from "../shared/supabaseClient";

const CLIENTE_ID = "d54bee09-4243-4036-898e-e6cbf9638952";

type UnidadeNegocio = "arquitetura" | "engenharia" | "marcenaria";

async function gerarFinanceiroContrato(
  contrato: any,
  config: {
    numero_parcelas: number;
    dia_vencimento: number;
    valor_entrada: number;
    percentual_entrada: number;
  }
) {
  const total = Number(contrato.valor_total || 0);
  const numParcelas = config.numero_parcelas ?? 0;
  const percEntrada = config.percentual_entrada ?? 0;
  const valorEntrada = config.valor_entrada ?? 0;

  const valorRestante = total - (valorEntrada || 0);
  const valorParcela = numParcelas > 0 ? valorRestante / numParcelas : 0;

  const diaVenc = config.dia_vencimento || new Date().getDate();
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setDate(diaVenc);

  const lancamentos: any[] = [];

  if (valorEntrada > 0) {
    lancamentos.push({
      id: uuid(),
      tipo: "entrada",
      status: "previsto",
      descricao: `Entrada contrato ${contrato.numero}${
        contrato.unidade_negocio
          ? ` - ${String(contrato.unidade_negocio).toUpperCase()}`
          : ""
      }`,
      valor_total: valorEntrada,
      pessoa_id: contrato.cliente_id,
      contrato_id: contrato.id,
      nucleo: contrato.unidade_negocio,
      categoria_id: null,
      data_competencia: baseDate.toISOString().split("T")[0],
      vencimento: baseDate.toISOString().split("T")[0],
    });
  }

  for (let i = 0; i < numParcelas; i++) {
    const venc = new Date(baseDate);
    venc.setMonth(venc.getMonth() + i);

    lancamentos.push({
      id: uuid(),
      tipo: "entrada",
      status: "previsto",
      descricao: `Parcela ${i + 1}/${numParcelas} contrato ${contrato.numero}${
        contrato.unidade_negocio
          ? ` - ${String(contrato.unidade_negocio).toUpperCase()}`
          : ""
      }`,
      valor_total: valorParcela,
      pessoa_id: contrato.cliente_id,
      contrato_id: contrato.id,
      nucleo: contrato.unidade_negocio,
      categoria_id: null,
      data_competencia: venc.toISOString().split("T")[0],
      vencimento: venc.toISOString().split("T")[0],
    });
  }

  if (lancamentos.length === 0) {
    throw new Error("Nenhum lançamento financeiro foi gerado.");
  }

  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .insert(lancamentos)
    .select("id");

  if (error) {
    throw error;
  }

  return {
    financeiro_ids: data?.map((d: any) => d.id) ?? [],
    parcelas_criadas: numParcelas,
  };
}

async function criarResumoFinanceiroContrato(
  contrato: any,
  config: {
    numero_parcelas: number;
    valor_entrada: number;
    percentual_entrada: number;
  },
  clienteNome: string | null
) {
  const valorTotal = Number(contrato.valor_total || 0);
  const valorEntrada = config.valor_entrada ?? 0;
  const numeroParcelas = config.numero_parcelas ?? 0;

  await supabase.from("financeiro_projetos_resumo").upsert(
    {
      contrato_id: contrato.id,
      cliente_id: contrato.cliente_id,
      cliente_nome: clienteNome || contrato.cliente_nome || "",
      numero: contrato.numero,
      nucleo: contrato.unidade_negocio,
      valor_total: valorTotal,
      valor_entrada: valorEntrada,
      numero_parcelas: numeroParcelas,
      data_inicio: contrato.data_inicio,
      data_previsao_termino: contrato.data_previsao_termino,
      status: contrato.status || "ativo",
    },
    { onConflict: "contrato_id" }
  );
}

async function main() {
  console.log("▶ Iniciando teste do pipeline financeiro...");

  // 1) Buscar cliente para confirmação
  const { data: cliente, error: clienteError } = await supabase
    .from("pessoas")
    .select("id,nome")
    .eq("id", CLIENTE_ID)
    .single();

  if (clienteError || !cliente) {
    console.error("❌ Cliente não encontrado:", clienteError);
    return;
  }

  console.log(`✔ Cliente de teste: ${cliente.nome} (${cliente.id})`);

  // 2) Criar contrato de teste
  const unidade_negocio: UnidadeNegocio = "engenharia";
  const agora = new Date();
  const dataInicioIso = agora.toISOString().split("T")[0];
  const dataPrevisao = new Date(agora);
  dataPrevisao.setDate(dataPrevisao.getDate() + 90);
  const dataPrevisaoIso = dataPrevisao.toISOString().split("T")[0];

  const numeroContrato = `TEST-FIN-${agora.getFullYear()}${String(
    agora.getMonth() + 1
  ).padStart(2, "0")}${String(agora.getDate()).padStart(
    2,
    "0"
  )}-${agora.getHours()}${agora.getMinutes()}${agora.getSeconds()}`;

  const valorTotal = 10000;
  const valorMaoObra = 6000;
  const valorMateriais = 4000;
  const percentualEntrada = 30;
  const numeroParcelas = 3;
  const valorEntrada = (valorTotal * percentualEntrada) / 100;

  const { data: contrato, error: contratoError } = await supabase
    .from("contratos")
    .insert({
      numero: numeroContrato,
      cliente_id: cliente.id,
      unidade_negocio,
      descricao: "Contrato de teste automático para validar pipeline financeiro.",
      valor_total: valorTotal,
      valor_mao_obra: valorMaoObra,
      valor_materiais: valorMateriais,
      status: "ativo",
      data_inicio: dataInicioIso,
      data_previsao_termino: dataPrevisaoIso,
      forma_pagamento: "parcelado",
      percentual_entrada: percentualEntrada,
      numero_parcelas: numeroParcelas,
      valor_entrada: valorEntrada,
    })
    .select("*")
    .single();

  if (contratoError || !contrato) {
    console.error("❌ Erro ao criar contrato de teste:", contratoError);
    return;
  }

  console.log("✔ Contrato de teste criado:", contrato.id, numeroContrato);

  // 3) Criar alguns itens do contrato (para não ficar sem memorial)
  const itens = [
    {
      contrato_id: contrato.id,
      tipo: "mao_obra",
      descricao: "Serviços de engenharia - execução",
      quantidade: 1,
      unidade: "un",
      valor_unitario: 6000,
      valor_total: 6000,
      producao_diaria: null,
      dias_estimados: null,
      categoria: "Engenharia",
      nucleo: unidade_negocio,
      ordem: 1,
    },
    {
      contrato_id: contrato.id,
      tipo: "material",
      descricao: "Materiais diversos de obra (teste)",
      quantidade: 1,
      unidade: "un",
      valor_unitario: 4000,
      valor_total: 4000,
      producao_diaria: null,
      dias_estimados: null,
      categoria: "Engenharia",
      nucleo: unidade_negocio,
      ordem: 2,
    },
  ];

  const { error: itensError } = await supabase
    .from("contratos_itens")
    .insert(itens);

  if (itensError) {
    console.error("❌ Erro ao inserir itens do contrato:", itensError);
    return;
  }

  console.log("✔ Itens de contrato inseridos (2 registros).");

  // 4) Gerar financeiro (entrada + parcelas)
  try {
    const financeiro = await gerarFinanceiroContrato(contrato, {
      numero_parcelas: numeroParcelas,
      dia_vencimento: agora.getDate(),
      valor_entrada: valorEntrada,
      percentual_entrada: percentualEntrada,
    });

    console.log(
      `✔ Lançamentos financeiros criados: ${financeiro.financeiro_ids.length} registros.`
    );

    // 4b) Criar cobranças correspondentes (uma por lançamento financeiro)
    if (financeiro.financeiro_ids.length > 0) {
      const { data: lancamentos, error: lancError } = await supabase
        .from("financeiro_lancamentos")
        .select("id, valor_total, vencimento")
        .in("id", financeiro.financeiro_ids);

      if (lancError) {
        console.error("⚠ Erro ao ler lançamentos para gerar cobranças:", lancError);
      } else {
        const cobrancasPayload =
          (lancamentos || []).map((l: any) => ({
            obra_id: null,
            cliente: cliente.nome,
            valor: l.valor_total,
            vencimento: l.vencimento,
            status: "Pendente",
            dados_bancarios: { financeiro_lancamento_id: l.id },
          })) ?? [];

        if (cobrancasPayload.length > 0) {
          const { error: cobrancaError } = await supabase
            .from("cobrancas")
            .insert(cobrancasPayload);

          if (cobrancaError) {
            console.error("⚠ Erro ao criar cobranças automáticas:", cobrancaError);
          } else {
            console.log(
              `✔ Cobranças criadas automaticamente em 'cobrancas': ${cobrancasPayload.length} registros.`
            );
          }
        }
      }
    }
  } catch (err: any) {
    console.error("❌ Erro ao gerar financeiro:", err);
    return;
  }

  // 5) Criar/atualizar resumo financeiro do projeto (card)
  try {
    await criarResumoFinanceiroContrato(
      contrato,
      {
        numero_parcelas: numeroParcelas,
        valor_entrada: valorEntrada,
        percentual_entrada: percentualEntrada,
      },
      cliente.nome
    );

    console.log(
      "✔ Resumo financeiro/projetos atualizado em `financeiro_projetos_resumo`."
    );
  } catch (err) {
    console.error("⚠ Erro ao criar resumo financeiro:", err);
  }

  console.log("\n✅ Teste concluído.");
  console.log(
    "Agora confira no front:\n" +
      `  - Financeiro > Projetos: contrato ${numeroContrato}\n` +
      "  - Financeiro > Lançamentos: entradas geradas para este contrato\n"
  );
}

main().catch((err) => {
  console.error("❌ Erro inesperado no teste:", err);
});
