// backend/src/contracts/createContractsByNucleo.ts
// =======================================================
// Serviço: Criação de Contratos por Núcleo
// Sistema WG Easy - Backend Oficial
// =======================================================

import { groupItemsByNucleo, ItemProposta } from "./groupItemsByNucleo";

// Status básico de contrato
export type StatusContrato =
  | "rascunho"
  | "aguardando_assinatura"
  | "ativo"
  | "concluido"
  | "cancelado";

// Interface correta (sem valores dentro)
export interface ContratoPorNucleo {
  id: string;
  cliente_id: string;
  nucleo_id: string;
  status: StatusContrato;
  criado_em: string; // sempre string (ISO)
  observacoes?: string;
}

export interface ContratoComItensPorNucleo {
  contrato: ContratoPorNucleo;
  itens: ItemProposta[];
}

export interface CreateContractsByNucleoInput {
  clienteId: string;
  nucleosSelecionados: string[];
  itens: ItemProposta[];
  observacoes?: string;

  gerarId?: () => string;
  dataReferencia?: Date;
}

/**
 * Regra principal:
 * - agrupa os itens por núcleo
 * - cria 1 contrato para cada núcleo selecionado
 */
export function createContractsByNucleo(
  input: CreateContractsByNucleoInput
): ContratoComItensPorNucleo[] {
  const {
    clienteId,
    nucleosSelecionados,
    itens,
    observacoes,
    gerarId = defaultGenerateId,
    dataReferencia = new Date(),
  } = input;

  if (!clienteId) throw new Error("clienteId é obrigatório.");
  if (!nucleosSelecionados?.length)
    throw new Error("É necessário selecionar pelo menos um núcleo.");
  if (!itens?.length) throw new Error("Não há itens para criar contratos.");

  // 1) Agrupa os itens pelo núcleo
  const itensPorNucleo = groupItemsByNucleo(itens);

  const contratos: ContratoComItensPorNucleo[] = [];

  // 2) Cria um contrato para cada núcleo válido
  for (const nucleoId of nucleosSelecionados) {
    const itensDoNucleo = itensPorNucleo[nucleoId] || [];

    if (itensDoNucleo.length === 0) continue;

    const contrato: ContratoPorNucleo = {
      id: gerarId(),
      cliente_id: clienteId,
      nucleo_id: nucleoId,
      status: "rascunho",
      criado_em: new Date().toISOString(), // valor válido
      observacoes,
    };

    contratos.push({
      contrato,
      itens: itensDoNucleo,
    });
  }

  return contratos;
}

// =======================================================
// Gerador de ID simples (temporário)
// =======================================================
function defaultGenerateId(): string {
  return `ctr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
