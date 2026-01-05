// ============================================================
// Hook: usePricelistSearch
// Busca de produtos no catálogo (pricelist)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { ProdutoPricelist } from '../types';

interface UsePricelistSearchReturn {
  // Estados
  produtos: ProdutoPricelist[];
  loading: boolean;
  error: string | null;
  termo: string;

  // Ações
  buscar: (termo: string) => Promise<void>;
  limpar: () => void;
  setTermo: (termo: string) => void;
}

export function usePricelistSearch(): UsePricelistSearchReturn {
  const [produtos, setProdutos] = useState<ProdutoPricelist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termo, setTermo] = useState('');

  // Ref para controlar debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // BUSCAR PRODUTOS
  // ============================================================
  const buscar = useCallback(async (termoBusca: string) => {
    // Limpar debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const termoLimpo = termoBusca.trim();
    setTermo(termoLimpo);

    // Se termo vazio, limpar resultados
    if (!termoLimpo || termoLimpo.length < 2) {
      setProdutos([]);
      setError(null);
      return;
    }

    // Debounce de 300ms
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // Tentar usar a function RPC primeiro
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'buscar_produtos_lista_compras',
          { termo: termoLimpo }
        );

        if (!rpcError && rpcData) {
          setProdutos(rpcData);
          return;
        }

        // Fallback: busca direta na tabela pricelist_itens
        console.log('Fallback para busca direta em pricelist_itens');

        const { data, error: fetchError } = await supabase
          .from('pricelist_itens')
          .select(
            `
            id,
            codigo,
            nome,
            descricao,
            fabricante,
            modelo,
            linha,
            preco,
            unidade,
            imagem_url,
            link_produto,
            categoria_id,
            fornecedor_id
          `
          )
          .eq('ativo', true)
          .or(
            `codigo.ilike.%${termoLimpo}%,nome.ilike.%${termoLimpo}%,fabricante.ilike.%${termoLimpo}%,modelo.ilike.%${termoLimpo}%`
          )
          .limit(50);

        if (fetchError) throw fetchError;

        setProdutos(data || []);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Erro ao buscar produtos');
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // ============================================================
  // LIMPAR RESULTADOS
  // ============================================================
  const limpar = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setProdutos([]);
    setTermo('');
    setError(null);
  }, []);

  return {
    produtos,
    loading,
    error,
    termo,
    buscar,
    limpar,
    setTermo,
  };
}

export default usePricelistSearch;
