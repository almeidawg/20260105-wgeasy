// ============================================================
// useItensProposta - Hook para gerenciar itens da proposta
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useCallback, useMemo } from "react";
import type {
  ItemProposta,
  ItemPricelist,
  Ambiente,
  TotaisGerais,
  TotaisPorNucleo,
  GrupoNucleo
} from "../types";
import type { NucleoItem, Nucleo } from "@/types/propostas";
import { getNucleoLabel, getNucleoColor, getCorProdutos } from "@/types/propostas";

export interface UseItensPropostaReturn {
  itens: ItemProposta[];
  totais: TotaisGerais;
  totaisPorNucleo: TotaisPorNucleo;
  gruposPorNucleo: GrupoNucleo[];
  adicionar: (item: ItemPricelist, ambienteId?: string, ambientes?: Ambiente[]) => void;
  adicionarMultiplos: (novosItens: ItemProposta[]) => void;
  remover: (id: string) => void;
  atualizarQuantidade: (id: string, quantidade: number) => void;
  atualizarValorUnitario: (id: string, valor: number) => void;
  atualizarDescricao: (id: string, descricao: string) => void;
  setItens: (itens: ItemProposta[]) => void;
  limpar: () => void;
}

// Obter quantidade inicial baseada no ambiente e unidade
function calcularQuantidadeInicial(
  item: ItemPricelist,
  ambienteId: string | undefined,
  ambientes: Ambiente[] | undefined
): number {
  if (!ambienteId || !ambientes) return 1;

  const ambiente = ambientes.find(a => a.id === ambienteId);
  if (!ambiente) return 1;

  if (item.unidade === "m2") {
    // Categorias de piso
    const categoriaPiso = ["piso", "revestimento piso", "ceramica", "porcelanato", "vinilico"];
    const categoriaParede = ["revestimento", "parede", "pintura", "azulejo", "textura"];
    const categoriaTeto = ["forro", "teto", "gesso"];

    const catLower = (item.categoria || "").toLowerCase();

    if (categoriaPiso.some(c => catLower.includes(c))) {
      return Number(ambiente.area_piso.toFixed(2));
    }
    if (categoriaParede.some(c => catLower.includes(c))) {
      return Number(ambiente.area_parede.toFixed(2));
    }
    if (categoriaTeto.some(c => catLower.includes(c))) {
      return Number(ambiente.area_teto.toFixed(2));
    }

    // Default: área do piso
    return Number(ambiente.area_piso.toFixed(2));
  }

  if (item.unidade === "ml") {
    return Number(ambiente.perimetro.toFixed(2));
  }

  return 1;
}

// Labels e cores para núcleos
function getNucleoLabelSafe(nucleo?: NucleoItem | "sem_nucleo"): string {
  if (!nucleo || nucleo === "sem_nucleo") return "Sem núcleo";
  if (nucleo === "produtos") return "Produtos";
  return getNucleoLabel(nucleo as Nucleo);
}

function getNucleoColorSafe(nucleo?: NucleoItem | "sem_nucleo"): string {
  if (!nucleo || nucleo === "sem_nucleo") return "#6B7280"; // gray-500
  if (nucleo === "produtos") return getCorProdutos();
  return getNucleoColor(nucleo as Nucleo);
}

export function useItensProposta(): UseItensPropostaReturn {
  const [itens, setItens] = useState<ItemProposta[]>([]);

  // Totais gerais
  const totais = useMemo<TotaisGerais>(() => {
    return itens.reduce((acc, item) => {
      const subtotal = item.quantidade * item.valor_unitario;
      if (item.item.tipo === "material") {
        acc.materiais += subtotal;
      } else if (item.item.tipo === "mao_obra") {
        acc.maoObra += subtotal;
      } else {
        // Ambos ou outro
        acc.materiais += subtotal / 2;
        acc.maoObra += subtotal / 2;
      }
      acc.total += subtotal;
      return acc;
    }, { materiais: 0, maoObra: 0, total: 0 });
  }, [itens]);

  // Totais por núcleo
  const totaisPorNucleo = useMemo<TotaisPorNucleo>(() => {
    return itens.reduce((acc, item) => {
      const subtotal = item.quantidade * item.valor_unitario;
      const nucleo = item.item.nucleo || "arquitetura";
      const tipo = item.item.tipo;

      acc.totalGeral += subtotal;

      if (nucleo === "arquitetura") {
        acc.arquitetura += subtotal;
      } else if (nucleo === "engenharia") {
        if (tipo === "material") {
          acc.engenhariaMateriais += subtotal;
        } else if (tipo === "mao_obra") {
          acc.engenhariaMaoObra += subtotal;
        } else if (tipo === "ambos") {
          acc.engenhariaMateriais += subtotal / 2;
          acc.engenhariaMaoObra += subtotal / 2;
        } else {
          acc.engenhariaMaoObra += subtotal;
        }
      } else if (nucleo === "marcenaria") {
        acc.marcenaria += subtotal;
      } else if (nucleo === "produtos") {
        acc.produtos += subtotal;
      }

      return acc;
    }, {
      arquitetura: 0,
      engenhariaMaoObra: 0,
      engenhariaMateriais: 0,
      marcenaria: 0,
      produtos: 0,
      totalGeral: 0,
    });
  }, [itens]);

  // Grupos por núcleo
  const gruposPorNucleo = useMemo<GrupoNucleo[]>(() => {
    const grupos: Record<string, GrupoNucleo> = {};

    itens.forEach(item => {
      const nucleo = item.item.nucleo || "sem_nucleo";

      if (!grupos[nucleo]) {
        grupos[nucleo] = {
          nucleo,
          label: getNucleoLabelSafe(nucleo),
          cor: getNucleoColorSafe(nucleo),
          itens: [],
          total: 0,
        };
      }

      grupos[nucleo].itens.push(item);
      grupos[nucleo].total += item.quantidade * item.valor_unitario;
    });

    // Ordenar: arquitetura, engenharia, marcenaria, produtos, sem_nucleo
    const ordem: (NucleoItem | "sem_nucleo")[] = ["arquitetura", "engenharia", "marcenaria", "produtos", "sem_nucleo"];
    return ordem
      .map(n => grupos[n])
      .filter(Boolean);
  }, [itens]);

  const adicionar = useCallback((
    item: ItemPricelist,
    ambienteId?: string,
    ambientes?: Ambiente[]
  ) => {
    const quantidade = calcularQuantidadeInicial(item, ambienteId, ambientes);

    const novoItem: ItemProposta = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      item,
      ambiente_id: ambienteId,
      ambientes_ids: ambienteId ? [ambienteId] : [],
      quantidade,
      valor_unitario: item.preco,
    };

    setItens(prev => [novoItem, ...prev]);
  }, []);

  const adicionarMultiplos = useCallback((novosItens: ItemProposta[]) => {
    setItens(prev => [...novosItens, ...prev]);
  }, []);

  const remover = useCallback((id: string) => {
    setItens(prev => prev.filter(item => item.id !== id));
  }, []);

  const atualizarQuantidade = useCallback((id: string, quantidade: number) => {
    setItens(prev => prev.map(item =>
      item.id === id ? { ...item, quantidade: Math.max(0.01, quantidade) } : item
    ));
  }, []);

  const atualizarValorUnitario = useCallback((id: string, valor: number) => {
    setItens(prev => prev.map(item =>
      item.id === id ? { ...item, valor_unitario: Math.max(0, valor) } : item
    ));
  }, []);

  const atualizarDescricao = useCallback((id: string, descricao: string) => {
    setItens(prev => prev.map(item =>
      item.id === id ? { ...item, descricao_customizada: descricao } : item
    ));
  }, []);

  const limpar = useCallback(() => {
    setItens([]);
  }, []);

  return {
    itens,
    totais,
    totaisPorNucleo,
    gruposPorNucleo,
    adicionar,
    adicionarMultiplos,
    remover,
    atualizarQuantidade,
    atualizarValorUnitario,
    atualizarDescricao,
    setItens,
    limpar,
  };
}

export default useItensProposta;
