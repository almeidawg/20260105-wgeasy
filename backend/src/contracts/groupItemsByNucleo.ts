// =============================================
// Função: Agrupa Itens por Núcleo
// Sistema WG Easy - Backend Oficial
// =============================================

export interface ItemProposta {
  id: string;
  nome: string;
  quantidade: number;
  preco_total: number;
  tipo: string; // mao_obra | material | servico | produto
  nucleo_id: string;
}

export function groupItemsByNucleo(items: ItemProposta[]) {
  const grupos: Record<string, ItemProposta[]> = {};

  for (const item of items) {
    const nucleo = item.nucleo_id;

    if (!grupos[nucleo]) {
      grupos[nucleo] = [];
    }

    grupos[nucleo].push(item);
  }

  return grupos;
}
