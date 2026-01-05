// backend/src/contracts/saveContractsToSupabase.ts
// =======================================================
// Serviço: Salvar Contratos no Supabase
// Sistema WG Easy - Backend Oficial
// =======================================================

import { createClient } from "@supabase/supabase-js";
import { ContratoComItensPorNucleo } from "./createContractsByNucleo";

// =======================================================
// CONFIGURAÇÃO DO SUPABASE (service_role)
// =======================================================

// IMPORTANTE: coloque sua service_role aqui ANTES de usar em produção
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ahlqzzkxuutwoepirpzr.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo";

// Cliente Supabase com service_role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// =======================================================
// Função: Salvar Contratos + Itens no Supabase
// =======================================================

export async function saveContractsToSupabase(
  contratos: ContratoComItensPorNucleo[]
) {
  const resultados: any[] = [];

  for (const item of contratos) {
    const { contrato, itens } = item;

    // 1) Inserir o contrato
    const { data: contratoDB, error: contratoErro } = await supabase
      .from("contratos")
      .insert({
        id: contrato.id,
        cliente_id: contrato.cliente_id,
        nucleo_id: contrato.nucleo_id,
        status: contrato.status,
        criado_em: contrato.criado_em,
        observacoes: contrato.observacoes || null,
      })
      .select("id")
      .single();

    if (contratoErro) {
      console.error("❌ Erro ao salvar contrato:", contratoErro);
      throw contratoErro;
    }

    // 2) Inserir os itens do contrato
    const itensFormatados = itens.map((i) => ({
      contrato_id: contrato.id,
      item_id: i.id,
      nome_item: i.nome,
      quantidade: i.quantidade,
      preco_total: i.preco_total,
      tipo_item: i.tipo,
      nucleo_id: i.nucleo_id,
    }));

    const { error: itensErro } = await supabase
      .from("contrato_itens")
      .insert(itensFormatados);

    if (itensErro) {
      console.error("❌ Erro ao salvar itens:", itensErro);
      throw itensErro;
    }

    resultados.push({
      contrato: contratoDB,
      itens: itensFormatados,
    });
  }

  return resultados;
}
