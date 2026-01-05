// ============================================================
// usePricelistBusca - Hook para buscar itens no pricelist
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useCallback, useMemo, useEffect } from "react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import type { ItemPricelist, FiltrosPricelist, TipoItem } from "../types";
import type { NucleoItem } from "@/types/propostas";

export interface UsePricelistBuscaReturn {
  itens: ItemPricelist[];
  itensFiltrados: ItemPricelist[];
  categorias: string[];
  loading: boolean;
  filtros: FiltrosPricelist;
  setFiltros: (filtros: FiltrosPricelist) => void;
  buscar: (termo: string) => void;
  carregar: () => Promise<void>;
  limpar: () => void;
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
}

function normalizarNucleoItem(nome?: string | null): NucleoItem | undefined {
  if (!nome) return undefined;
  const v = nome.toLowerCase();
  if (v.startsWith("arq")) return "arquitetura";
  if (v.startsWith("eng")) return "engenharia";
  if (v.startsWith("mar")) return "marcenaria";
  if (v.startsWith("prod")) return "produtos";
  if (v.startsWith("mat")) return "produtos";
  if (["arquitetura", "engenharia", "marcenaria", "produtos"].includes(v)) {
    return v as NucleoItem;
  }
  return undefined;
}

export function usePricelistBusca(): UsePricelistBuscaReturn {
  const [itens, setItens] = useState<ItemPricelist[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosPricelist>({});

  // Carregar todos os itens ativos do pricelist
  const carregar = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("pricelist_itens")
        .select(`
          *,
          nucleo:nucleos!nucleo_id(id, nome)
        `)
        .eq("ativo", true)
        .order("nome");

      if (error) {
        console.error("Erro ao carregar pricelist:", error);
        return;
      }

      const itensConvertidos: ItemPricelist[] = (data || []).map((item: any) => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        descricao: item.descricao,
        categoria: item.categoria,
        tipo: item.tipo,
        unidade: item.unidade,
        preco: item.preco,
        imagem_url: item.imagem_url,
        // NOVO: Usar nome do núcleo do join
        nucleo: normalizarNucleoItem(item.nucleo?.nome),
        nucleo_id: item.nucleo_id,
        fabricante: item.fabricante,
        modelo: item.modelo,
        fornecedor_id: item.fornecedor_id,
        ativo: item.ativo,
      }));

      setItens(itensConvertidos);
    } catch (error) {
      console.error("Erro ao carregar pricelist:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar na montagem
  useEffect(() => {
    carregar();
  }, [carregar]);

  // Categorias únicas
  const categorias = useMemo(() => {
    const cats = new Set<string>();
    itens.forEach(item => {
      if (item.categoria) cats.add(item.categoria);
    });
    return Array.from(cats).sort();
  }, [itens]);

  // Itens filtrados
  const itensFiltrados = useMemo(() => {
    if (!filtros.busca || filtros.busca.trim().length < 2) {
      return [];
    }

    // Stop words para ignorar
    const stopWords = ["de", "do", "da", "dos", "das", "e", "em", "para", "com", "o", "a", "os", "as", "um", "uma"];

    // Dividir busca em palavras
    const palavrasBusca = normalizarTexto(filtros.busca)
      .split(/\s+/)
      .filter(p => p.length > 1 && !stopWords.includes(p));

    if (palavrasBusca.length === 0) return [];

    return itens.filter(item => {
      // Filtrar por tipo
      if (filtros.tipo && item.tipo !== filtros.tipo) return false;

      // Filtrar por núcleo
      if (filtros.nucleo && item.nucleo !== filtros.nucleo) return false;

      // Filtrar por categoria
      if (filtros.categoria && item.categoria !== filtros.categoria) return false;

      // Filtrar por preço
      if (filtros.precoMin && item.preco < filtros.precoMin) return false;
      if (filtros.precoMax && item.preco > filtros.precoMax) return false;

      // Buscar texto
      const textoItem = normalizarTexto([
        item.nome || "",
        item.codigo || "",
        item.descricao || "",
        item.categoria || "",
        item.fabricante || "",
        item.modelo || "",
      ].join(" "));

      // Todas as palavras devem estar presentes
      return palavrasBusca.every(palavra => textoItem.includes(palavra));
    });
  }, [itens, filtros]);

  const buscar = useCallback((termo: string) => {
    setFiltros(prev => ({ ...prev, busca: termo }));
  }, []);

  const limpar = useCallback(() => {
    setFiltros({});
  }, []);

  return {
    itens,
    itensFiltrados,
    categorias,
    loading,
    filtros,
    setFiltros,
    buscar,
    carregar,
    limpar,
  };
}

export default usePricelistBusca;
