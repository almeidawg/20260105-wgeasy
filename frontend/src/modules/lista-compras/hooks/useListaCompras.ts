// ============================================================
// Hook: useListaCompras
// CRUD completo para lista de compras
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  ItemListaCompra,
  NovoItemListaCompra,
  AtualizarItemListaCompra,
  FiltrosListaCompras,
  StatusItem,
  TipoCompra,
} from '../types';

interface UseListaComprasReturn {
  // Estados
  itens: ItemListaCompra[];
  loading: boolean;
  error: string | null;

  // CRUD
  carregar: () => Promise<void>;
  adicionarItem: (item: NovoItemListaCompra) => Promise<ItemListaCompra | null>;
  adicionarMultiplos: (itens: NovoItemListaCompra[]) => Promise<ItemListaCompra[]>;
  atualizarItem: (dados: AtualizarItemListaCompra) => Promise<ItemListaCompra | null>;
  removerItem: (id: string) => Promise<boolean>;

  // Ações rápidas
  alterarStatus: (id: string, status: StatusItem) => Promise<boolean>;
  alterarTipoCompra: (id: string, tipo: TipoCompra) => Promise<boolean>;
  alterarQuantidade: (id: string, qtd: number) => Promise<boolean>;

  // Filtros
  filtros: FiltrosListaCompras;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosListaCompras>>;
  itensFiltrados: ItemListaCompra[];

  // Utilitários
  limparErro: () => void;
}

export function useListaCompras(projetoId: string): UseListaComprasReturn {
  const [itens, setItens] = useState<ItemListaCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosListaCompras>({});

  // ============================================================
  // CARREGAR ITENS
  // ============================================================
  const carregar = useCallback(async () => {
    if (!projetoId) {
      setItens([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('lista_compras_itens')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('ambiente', { ascending: true })
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setItens(data || []);
    } catch (err) {
      console.error('Erro ao carregar lista de compras:', err);
      setError('Erro ao carregar lista de compras');
    } finally {
      setLoading(false);
    }
  }, [projetoId]);

  // Carregar ao montar ou mudar projeto
  useEffect(() => {
    carregar();
  }, [carregar]);

  // ============================================================
  // ADICIONAR ITEM
  // ============================================================
  const adicionarItem = useCallback(
    async (item: NovoItemListaCompra): Promise<ItemListaCompra | null> => {
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from('lista_compras_itens')
          .insert([
            {
              ...item,
              projeto_id: projetoId,
              status: 'PENDENTE',
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // Atualizar estado local
        setItens((prev) => [...prev, data]);

        return data;
      } catch (err) {
        console.error('Erro ao adicionar item:', err);
        setError('Erro ao adicionar item');
        return null;
      }
    },
    [projetoId]
  );

  // ============================================================
  // ADICIONAR MÚLTIPLOS (para complementares)
  // ============================================================
  const adicionarMultiplos = useCallback(
    async (novosItens: NovoItemListaCompra[]): Promise<ItemListaCompra[]> => {
      setError(null);

      try {
        const itensComProjeto = novosItens.map((item) => ({
          ...item,
          projeto_id: projetoId,
          status: 'PENDENTE' as const,
        }));

        const { data, error: insertError } = await supabase
          .from('lista_compras_itens')
          .insert(itensComProjeto)
          .select();

        if (insertError) throw insertError;

        // Atualizar estado local
        setItens((prev) => [...prev, ...(data || [])]);

        return data || [];
      } catch (err) {
        console.error('Erro ao adicionar itens:', err);
        setError('Erro ao adicionar itens');
        return [];
      }
    },
    [projetoId]
  );

  // ============================================================
  // ATUALIZAR ITEM
  // ============================================================
  const atualizarItem = useCallback(
    async (dados: AtualizarItemListaCompra): Promise<ItemListaCompra | null> => {
      setError(null);

      const { id, ...updateData } = dados;

      try {
        const { data, error: updateError } = await supabase
          .from('lista_compras_itens')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Atualizar estado local
        setItens((prev) => prev.map((item) => (item.id === id ? data : item)));

        return data;
      } catch (err) {
        console.error('Erro ao atualizar item:', err);
        setError('Erro ao atualizar item');
        return null;
      }
    },
    []
  );

  // ============================================================
  // REMOVER ITEM
  // ============================================================
  const removerItem = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('lista_compras_itens')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar estado local (remove item e seus complementares)
      setItens((prev) => prev.filter((item) => item.id !== id && item.item_pai_id !== id));

      return true;
    } catch (err) {
      console.error('Erro ao remover item:', err);
      setError('Erro ao remover item');
      return false;
    }
  }, []);

  // ============================================================
  // AÇÕES RÁPIDAS
  // ============================================================
  const alterarStatus = useCallback(
    async (id: string, status: StatusItem): Promise<boolean> => {
      const atualizacoes: Partial<AtualizarItemListaCompra> = { id, status };

      // Definir datas automaticamente
      if (status === 'APROVADO') {
        Object.assign(atualizacoes, { data_aprovacao: new Date().toISOString() });
      } else if (status === 'COMPRADO') {
        Object.assign(atualizacoes, { data_compra: new Date().toISOString() });
      } else if (status === 'ENTREGUE') {
        Object.assign(atualizacoes, { data_entrega: new Date().toISOString() });
      }

      const result = await atualizarItem(atualizacoes as AtualizarItemListaCompra);
      return result !== null;
    },
    [atualizarItem]
  );

  const alterarTipoCompra = useCallback(
    async (id: string, tipo: TipoCompra): Promise<boolean> => {
      const result = await atualizarItem({ id, tipo_compra: tipo });
      return result !== null;
    },
    [atualizarItem]
  );

  const alterarQuantidade = useCallback(
    async (id: string, qtd: number): Promise<boolean> => {
      const result = await atualizarItem({ id, qtd_compra: qtd });
      return result !== null;
    },
    [atualizarItem]
  );

  // ============================================================
  // FILTROS
  // ============================================================
  const itensFiltrados = itens.filter((item) => {
    if (filtros.ambiente && item.ambiente !== filtros.ambiente) return false;
    if (filtros.categoria && item.categoria !== filtros.categoria) return false;
    if (filtros.status && item.status !== filtros.status) return false;
    if (filtros.tipo_compra && item.tipo_compra !== filtros.tipo_compra) return false;
    if (filtros.fornecedor && item.fornecedor_nome !== filtros.fornecedor) return false;
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      const match =
        item.item?.toLowerCase().includes(busca) ||
        item.descricao?.toLowerCase().includes(busca) ||
        item.categoria?.toLowerCase().includes(busca) ||
        item.fornecedor_nome?.toLowerCase().includes(busca);
      if (!match) return false;
    }
    return true;
  });

  // ============================================================
  // UTILITÁRIOS
  // ============================================================
  const limparErro = useCallback(() => {
    setError(null);
  }, []);

  return {
    itens,
    loading,
    error,
    carregar,
    adicionarItem,
    adicionarMultiplos,
    atualizarItem,
    removerItem,
    alterarStatus,
    alterarTipoCompra,
    alterarQuantidade,
    filtros,
    setFiltros,
    itensFiltrados,
    limparErro,
  };
}

export default useListaCompras;
